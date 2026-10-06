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
use Illuminate\Validation\Rules\Password;
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

        $validated = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'company_address' => ['nullable', 'string', 'max:1000'],
            'company_phone' => ['nullable', 'string', 'max:30'],
            'employee_count' => ['nullable', 'integer', 'min:1'],
            'established_since' => ['nullable', 'string', 'max:4'],
            'pic_name' => $isMember ? ['nullable', 'string', 'max:255'] : ['required', 'string', 'max:255'],
            'pic_email' => $isMember ? ['nullable', 'email', 'max:255'] : ['required', 'email', 'max:255'],
            'pic_whatsapp' => $isMember ? ['nullable', 'string', 'max:30'] : ['required', 'string', 'max:30'],
            'pic_phone' => $isMember ? ['nullable', 'string', 'max:30'] : ['required', 'string', 'max:30'],
            'is_member' => ['required', 'boolean'],
            'member_email' => $isMember
                ? ['required', 'email', 'max:255', Rule::exists('users', 'email')->where('role', User::ROLE_MEMBER)]
                : ['nullable', 'email', 'max:255'],
            'name' => $isMember ? ['nullable', 'string', 'max:255'] : ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->where('role', User::ROLE_VENDOR),
                Rule::unique('partners', 'email'),
            ],
            'password' => ['required', 'string', Password::defaults(), 'confirmed'],
            'phone' => ['nullable', 'string', 'max:30'],
            'date_of_birth' => ['nullable', 'date'],
            'industry' => ['required'],
            'hobbies' => ['nullable', 'array'],
            'hobbies.*' => ['string', 'max:255'],
        ], [
            'industry.required' => 'Bidang industri wajib dipilih minimal 1.',
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
                ->where('email', $validated['member_email'])
                ->first();

            if (! $memberUser) {
                return back()->withErrors(['member_email' => 'Email member tidak ditemukan.'])->withInput();
            }
        }

        // Data diri diambil dari master identity member bila "sudah bergabung".
        $name = $validated['name'] ?? $memberUser?->name;
        $dateOfBirth = $validated['date_of_birth'] ?? null;
        $picName = $validated['pic_name'] ?? $name;
        $picEmail = $validated['pic_email'] ?? $validated['email'];
        $picWhatsapp = $validated['pic_whatsapp'] ?? null;
        $picPhone = $validated['pic_phone'] ?? null;

        if ($memberUser) {
            $dateOfBirth = $memberUser->birth_date?->toDateString() ?? $dateOfBirth;
            $picName = $validated['pic_name'] ?? $memberUser->name;
            $picWhatsapp = $validated['pic_whatsapp'] ?? ($memberUser->whatsapp ?: $memberUser->phone);
            $picPhone = $validated['pic_phone'] ?? ($memberUser->phone ?: $memberUser->whatsapp);
        }

        if (! $name) {
            return back()->withErrors(['name' => 'Nama wajib diisi.'])->withInput();
        }

        DB::beginTransaction();

        try {
            $identity = MasterIdentity::forEmail($validated['email'], [
                'name' => $name,
                'phone' => $validated['phone'] ?? null,
                'birth_date' => $dateOfBirth,
            ]);

            $user = User::create([
                'name' => $name,
                'email' => $validated['email'],
                'password' => $validated['password'],
                'role' => User::ROLE_VENDOR,
                'phone' => $validated['phone'] ?? null,
                // Belum dianggap terverifikasi sebelum OTP sukses.
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
                'pic_name' => $picName,
                'pic_email' => $picEmail,
                'pic_whatsapp' => $picWhatsapp,
                'pic_phone' => $picPhone,
                'is_member' => $isMember,
                'member_email' => $isMember ? $validated['member_email'] : null,
                'member_user_id' => $memberUser?->id,
                'member_code' => $isMember ? $memberUser->member_code : null,
                'member_id_number' => $isMember ? $memberUser->member_code : null,
                'member_name' => $isMember ? $memberUser->name : null,
                'member_birth_date' => $dateOfBirth,
                'industry' => $industryString,
                'hobbies' => $validated['hobbies'] ?? null,
                'date_of_birth' => $dateOfBirth,
                'is_active' => false,
                'status' => Partner::STATUS_INACTIVE,
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
