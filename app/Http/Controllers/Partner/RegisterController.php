<?php

namespace App\Http\Controllers\Partner;

use App\Http\Controllers\Controller;
use App\Models\MasterIdentity;
use App\Models\Partner;
use App\Models\User;
use App\Services\PasswordOtpService;
use App\Support\PartnerCategory;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    public function __construct(private readonly PasswordOtpService $otp) {}

    public function show(): Response
    {
        return Inertia::render('Partner/Register');
    }

    public function store(Request $request): RedirectResponse
    {
        $isMember = $request->boolean('is_member');
        $isHousehold = $request->boolean('is_household');

        // "Belum punya akun member" → 4 form Master Identity wajib diisi seperti registrasi member.
        $relaxBiodata = $isMember || $isHousehold;

        $validated = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'company_address' => ['nullable', 'string', 'max:1000'],
            'company_phone' => ['nullable', 'string', 'max:30'],
            'employee_count' => ['nullable', 'integer', 'min:1'],
            'established_since' => ['nullable', 'string', 'max:4'],
            'is_member' => ['required', 'boolean'],
            'member_email' => $isMember
                ? ['required', 'email', 'max:255', Rule::exists('users', 'email')->where('role', User::ROLE_MEMBER)]
                : ['nullable', 'email', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->where('role', User::ROLE_VENDOR),
                Rule::unique('partners', 'email'),
            ],
            // Password tidak diisi user; di-generate otomatis → dikirim email setelah admin approve.
            // 'password' => removed
            'phone' => $isMember ? ['nullable', 'string', 'max:30'] : ['required', 'string', 'max:30'],
            'industry' => ['required'],
            // Data diri (4 section Master Identity).
            'name' => $isMember ? ['nullable', 'string', 'max:255'] : ['required', 'string', 'max:255'],
            'nickname' => ['nullable', 'string', 'max:100'],
            'gender' => ['nullable', 'string', 'max:50'],
            'birth_date' => ['nullable', 'date'],
            'birth_place' => ['nullable', 'string', 'max:100'],
            'marital_status' => ['nullable', 'string', 'max:50'],
            'religion' => ['nullable', 'string', 'max:100'],
            'place_of_worship_address' => ['nullable', 'string', 'max:500'],
            'address' => ['nullable', 'string', 'max:500'],
            'district' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'hobbies' => ['nullable', 'array'],
            'hobbies.*' => ['string', 'max:255'],
            'is_household' => ['boolean'],
            'business_district' => ['nullable', 'string', 'max:100'],
            'business_city' => ['nullable', 'string', 'max:100'],
            'companies' => ($relaxBiodata ? 'nullable' : 'required').'|array'.($relaxBiodata ? '' : '|min:1'),
            'companies.*.company' => ($relaxBiodata ? 'nullable' : 'required').'|string|max:255',
            'companies.*.industry' => ($relaxBiodata ? 'nullable' : 'required').'|string|max:100',
            'companies.*.position' => ($relaxBiodata ? 'nullable' : 'required').'|string|max:100',
            'companies.*.address' => 'nullable|string|max:500',
            // PIC opsional: kalau kosong diambil dari biodata / akun member.
            'pic_name' => ['nullable', 'string', 'max:255'],
            'pic_email' => ['nullable', 'email', 'max:255'],
            'pic_whatsapp' => ['nullable', 'string', 'max:30'],
            'pic_phone' => ['nullable', 'string', 'max:30'],
        ], [
            'industry.required' => 'Bidang industri wajib dipilih minimal 1.',
            'companies.required' => 'Silakan isi minimal 1 info usaha atau centang "Bapak/Ibu Rumah Tangga".',
            'companies.min' => 'Silakan isi minimal 1 info usaha atau centang "Bapak/Ibu Rumah Tangga".',
            'companies.*.company.required' => 'Nama perusahaan wajib diisi.',
            'companies.*.industry.required' => 'Bidang industri wajib dipilih.',
            'companies.*.position.required' => 'Jabatan wajib diisi.',
        ]);

        $industryInput = $request->input('industry');
        $industryString = is_array($industryInput) ? implode(', ', array_filter($industryInput)) : (string) $industryInput;
        if (empty(trim($industryString))) {
            return back()->withErrors(['industry' => 'Bidang industri wajib dipilih minimal 1.'])->withInput();
        }

        $memberUser = null;

        if ($isMember) {
            $memberUser = User::query()
                ->where('role', User::ROLE_MEMBER)
                ->whereRaw('lower(email) = ?', [strtolower($validated['member_email'])])
                ->first();

            if (! $memberUser) {
                return back()->withErrors(['member_email' => 'Email member tidak ditemukan.'])->withInput();
            }

            // OTP linking wajib lolos lebih dulu: tanpa itu data diri tidak boleh dipinjam.
            $verifiedMemberId = (int) $request->session()->get('member_link_verified_user_id');

            if ($verifiedMemberId !== (int) $memberUser->id) {
                return back()->withErrors([
                    'member_email' => 'Verifikasi OTP ke email member terlebih dahulu sebelum mengirim formulir.',
                ])->withInput();
            }
        }

        // Normalisasi daftar usaha: buang baris yang sepenuhnya kosong.
        $businesses = [];

        foreach ((array) $request->input('companies', []) as $c) {
            $cName = trim((string) ($c['company'] ?? ''));
            $cInd = trim((string) ($c['industry'] ?? ''));
            $cPos = trim((string) ($c['position'] ?? ''));
            $cAddr = trim((string) ($c['address'] ?? ''));

            if ($cName === '' && $cInd === '' && $cPos === '' && $cAddr === '') {
                continue;
            }

            $businesses[] = [
                'company' => $cName,
                'industry' => $cInd,
                'position' => $cPos,
                'address' => $cAddr,
            ];
        }

        $formattedCompanyParts = [];
        $extractedIndustries = [];
        $extractedFields = [];

        foreach ($businesses as $b) {
            if ($b['company'] !== '') {
                $formattedCompanyParts[] = $b['industry'] !== '' ? "{$b['company']} ({$b['industry']})" : $b['company'];
                $extractedFields[] = $b['company'];
            }
            if ($b['industry'] !== '') {
                $extractedIndustries[] = $b['industry'];
            }
        }

        DB::beginTransaction();

        try {
            $dateOfBirth = $validated['birth_date'] ?? null;
            $name = null;
            $picWhatsapp = null;
            $picPhone = null;
            $picName = null;
            $identity = null;

            if ($memberUser) {
                // Data diri dipinjam dari Master Identity member → form isian tidak diulang.
                $identity = $memberUser->masterIdentity;

                if (! $identity) {
                    $identity = MasterIdentity::forEmail($memberUser->email, [
                        'name' => $memberUser->name,
                        'phone' => $memberUser->phone,
                        'birth_date' => $memberUser->birth_date?->toDateString(),
                    ]);

                    $memberUser->forceFill(['master_identity_id' => $identity?->id])->save();
                }

                $dateOfBirth = $identity?->birth_date?->toDateString()
                    ?? $memberUser->birth_date?->toDateString()
                    ?? $dateOfBirth;
                // PIC & nama selalu diambil dari member yang sudah terverifikasi OTP.
                $name = $memberUser->name;
                $picName = $memberUser->name;
                $picWhatsapp = $memberUser->whatsapp ?: $memberUser->phone;
                $picPhone = $memberUser->phone ?: $memberUser->whatsapp;
            } else {
                $identity = MasterIdentity::forEmail($validated['email'], [
                    'name' => $validated['name'],
                    'phone' => $validated['phone'],
                    'birth_date' => $dateOfBirth,
                    'birth_place' => $validated['birth_place'] ?? null,
                    'gender' => $validated['gender'] ?? null,
                    'religion' => $validated['religion'] ?? null,
                    'marital_status' => $validated['marital_status'] ?? null,
                    'address' => $validated['address'] ?? null,
                    'city' => $validated['city'] ?? null,
                    'district' => $validated['district'] ?? null,
                    'hobbies' => $validated['hobbies'] ?? null,
                ]);

                $name = $validated['name'];
                $picName = $validated['pic_name'] ?? $name;
                $picWhatsapp = $validated['pic_whatsapp'] ?? $validated['phone'];
                $picPhone = $validated['pic_phone'] ?? $validated['phone'];
            }

            if (! $name) {
                DB::rollBack();

                return back()->withErrors(['name' => 'Nama wajib diisi.'])->withInput();
            }

            $user = User::create([
                'name' => $name,
                'nickname' => $memberUser?->nickname ?? $validated['nickname'] ?? null,
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? $memberUser?->phone,
                'whatsapp' => $validated['phone'] ?? $memberUser?->whatsapp ?? $memberUser?->phone,
                'gender' => $identity?->gender ?? $memberUser?->gender ?? $validated['gender'] ?? null,
                'birth_date' => $dateOfBirth,
                'birth_place' => $identity?->birth_place ?? $memberUser?->birth_place ?? $validated['birth_place'] ?? null,
                'hobbies' => $identity?->hobbies ?? $memberUser?->hobbies ?? $validated['hobbies'] ?? null,
                'marital_status' => $identity?->marital_status ?? $memberUser?->marital_status ?? $validated['marital_status'] ?? null,
                'religion' => $identity?->religion ?? $memberUser?->religion ?? $validated['religion'] ?? null,
                'place_of_worship_address' => $memberUser?->place_of_worship_address ?? $validated['place_of_worship_address'] ?? null,
                'address' => $identity?->address ?? $memberUser?->address ?? $validated['address'] ?? null,
                'district' => $identity?->district ?? $memberUser?->district ?? $validated['district'] ?? null,
                'city' => $identity?->city ?? $memberUser?->city ?? $validated['city'] ?? null,
                'company' => ! empty($formattedCompanyParts) ? implode(', ', $formattedCompanyParts) : null,
                'business_fields' => ! empty($extractedFields) ? $extractedFields : null,
                'business_address' => $businesses[0]['address'] ?? null,
                'business_district' => $validated['business_district'] ?? null,
                'business_city' => $validated['business_city'] ?? null,
                'businesses' => ! empty($businesses) ? $businesses : null,
                'is_household' => $isHousehold,
                'industry' => ! empty($extractedIndustries) ? implode(', ', $extractedIndustries) : null,
                'password' => \Illuminate\Support\Str::random(16),
                'role' => User::ROLE_VENDOR,
                'email_verified_at' => null,
                'approval_status' => User::APPROVAL_PENDING,
                'must_change_password' => true,
                'master_identity_id' => $identity?->id,
            ]);

            $partner = $user->partner()->create([
                'name' => $validated['company_name'],
                'slug' => Partner::slugFor($validated['company_name']),
                'category' => PartnerCategory::fromIndustries(
                    is_array($industryInput) ? array_filter($industryInput) : [$industryString]
                ),
                'address' => $validated['company_address'] ?? null,
                'phone' => $validated['company_phone'] ?? null,
                'email' => $validated['email'],
                'employee_count' => $validated['employee_count'] ?? null,
                'established_since' => $validated['established_since'] ?? null,
                'pic_name' => $picName ?? $name,
                'pic_email' => $validated['pic_email'] ?? $validated['email'],
                'pic_whatsapp' => $picWhatsapp,
                'pic_phone' => $picPhone,
                'is_member' => $isMember,
                'member_email' => $isMember ? $validated['member_email'] : null,
                'member_user_id' => $memberUser?->id,
                'member_code' => $memberUser?->member_code,
                'member_id_number' => $memberUser?->member_code,
                'member_name' => $memberUser?->name,
                'member_birth_date' => $dateOfBirth,
                'industry' => $industryString,
                'hobbies' => $memberUser?->hobbies ?? $validated['hobbies'] ?? null,
                'date_of_birth' => $dateOfBirth,
                'is_active' => false,
                'status' => Partner::STATUS_INACTIVE,
                // 1 partner hanya boleh terhubung ke 1 member; identity-nya sama dengan member.
                'master_identity_id' => $identity?->id,
            ]);

            DB::commit();
        } catch (QueryException $e) {
            DB::rollBack();

            $message = str_contains($e->getMessage(), 'partners.email')
                ? 'Email partner sudah terdaftar. Gunakan email lain.'
                : 'Registration failed. Please try again.';

            return back()->withErrors(['email' => $message])->withInput();
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors(['email' => 'Registration failed. Please try again.'])->withInput();
        }

        $request->session()->forget(['member_link_email', 'member_link_user_id', 'member_link_verified_user_id']);

        // OTP 6 digit ke email PIC partner; belum bisa login sebelum OTP sukses.
        $this->otp->issue(
            $user,
            PasswordOtpService::PURPOSE_PARTNER_REGISTER,
            'Verifikasi Email Partner KBKB',
            'Masukkan kode OTP 6 digit untuk menyelesaikan pendaftaran partner Anda.'
        );

        $request->session()->put('partner_otp_user_id', $user->id);

        return redirect()->route('partner.otp.show');
    }

    public function thankyou(Request $request): Response
    {
        return Inertia::render('Partner/ThankYou', [
            'status' => $request->session()->get('status'),
        ]);
    }
}
