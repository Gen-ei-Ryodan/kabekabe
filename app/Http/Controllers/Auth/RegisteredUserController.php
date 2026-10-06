<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\MasterIdentity;
use App\Models\Partner;
use App\Models\User;
use App\Services\PasswordOtpService;
use App\Support\PartnerCategory;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function __construct(private readonly PasswordOtpService $otp) {}

    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     */
    public function store(Request $request): Response|RedirectResponse
    {
        $roleInput = $request->input('role', 'member');

        if ($roleInput === 'partner') {
            $isMember = $request->boolean('is_member');

            $rules = [
                'role' => 'required|in:member,partner',
                'name' => 'required|string|max:255', // Nama Perusahaan
                'trade_name' => 'required|string|max:255', // Nama Merk Dagang
                'address' => 'required|string|max:500', // Alamat Usaha
                'phone' => 'required|string|max:30', // Nomor Telfon
                'email' => [
                    'required',
                    'string',
                    'lowercase',
                    'email',
                    'max:255',
                    Rule::unique('users', 'email')->where('role', User::ROLE_VENDOR),
                    Rule::unique('partners', 'email'),
                ],
                'employee_count' => 'nullable|integer|min:0',
                'established_since' => 'nullable|string|max:50',
                'is_member' => 'required|boolean',
                'district' => 'nullable|string|max:100',
                'city' => 'nullable|string|max:100',
                'category' => 'nullable|string|max:100',
                'industry' => 'required',
            ];

            $industryInput = $request->input('industry');
            $industryString = is_array($industryInput) ? implode(', ', array_filter($industryInput)) : (string) $industryInput;
            if (empty(trim($industryString))) {
                return back()->withErrors(['industry' => 'Bidang industri wajib dipilih minimal 1.'])->withInput();
            }

            if ($isMember) {
                $rules['member_id_number'] = 'required|string|max:100';
                $rules['member_name'] = 'required|string|max:255';
                $rules['member_birth_date'] = 'required|date';
            } else {
                $rules['pic_name'] = 'nullable|string|max:255';
                $rules['nickname'] = 'nullable|string|max:100';
                $rules['gender'] = 'nullable|string|max:50';
                $rules['birth_date'] = 'nullable|date';
                $rules['birth_place'] = 'nullable|string|max:100';
                $rules['hobbies'] = 'nullable|array';
                $rules['marital_status'] = 'nullable|string|max:50';
                $rules['religion'] = 'nullable|string|max:100';
                $rules['place_of_worship_address'] = 'nullable|string|max:500';
                $rules['member_phone'] = 'nullable|string|max:30';
                $rules['member_address'] = 'nullable|string|max:500';
                $rules['member_district'] = 'nullable|string|max:100';
                $rules['member_city'] = 'nullable|string|max:100';
            }

            $request->validate($rules, [
                'industry.required' => 'Bidang industri wajib dipilih minimal 1.',
            ]);

            $userName = $isMember
                ? $request->member_name
                : ($request->pic_name ?: $request->trade_name ?: $request->name);

            $identity = MasterIdentity::forEmail($request->email, [
                'name' => $userName,
                'phone' => $request->phone,
                'birth_date' => $isMember ? $request->member_birth_date : $request->birth_date,
                'birth_place' => $isMember ? null : $request->birth_place,
                'gender' => $isMember ? null : $request->gender,
            ]);

            $user = User::create([
                'name' => $userName,
                'nickname' => $isMember ? null : $request->nickname,
                'email' => $request->email,
                'phone' => $request->phone,
                'whatsapp' => $request->phone,
                'company' => $request->name,
                'address' => $isMember ? $request->address : ($request->member_address ?: $request->address),
                'district' => $isMember ? $request->district : ($request->member_district ?: $request->district),
                'city' => $isMember ? $request->city : ($request->member_city ?: $request->city),
                'industry' => $industryString,
                'gender' => $isMember ? null : $request->gender,
                'birth_date' => $isMember ? $request->member_birth_date : $request->birth_date,
                'birth_place' => $isMember ? null : $request->birth_place,
                'hobbies' => $isMember ? null : $request->hobbies,
                'marital_status' => $isMember ? null : $request->marital_status,
                'religion' => $isMember ? null : $request->religion,
                'place_of_worship_address' => $isMember ? null : $request->place_of_worship_address,
                'business_address' => $request->address,
                'business_district' => $request->district,
                'business_city' => $request->city,
                'password' => Hash::make(Str::random(40)),
                'role' => User::ROLE_VENDOR,
                'approval_status' => User::APPROVAL_PENDING,
                'must_change_password' => true,
                'master_identity_id' => $identity?->id,
            ]);

            $user->partner()->create([
                'name' => $request->name,
                'trade_name' => $request->trade_name,
                'slug' => Partner::slugFor($request->trade_name ?: $request->name),
                'pic_name' => $userName,
                'pic_phone' => $request->phone,
                'category' => PartnerCategory::fromIndustries(
                    is_array($industryInput) ? array_filter($industryInput) : [$industryString]
                ),
                'phone' => $request->phone,
                'email' => $request->email,
                'address' => $request->address,
                'district' => $request->district,
                'city' => $request->city,
                'industry' => $industryString,
                'employee_count' => $request->employee_count,
                'established_since' => $request->established_since,
                'is_member' => $isMember,
                'member_id_number' => $isMember ? $request->member_id_number : null,
                'member_name' => $isMember ? $request->member_name : $userName,
                'member_birth_date' => $isMember ? $request->member_birth_date : $request->birth_date,
                'joined_at' => now(),
                'is_active' => false,
                'status' => Partner::STATUS_INACTIVE,
                'master_identity_id' => $identity?->id,
            ]);
        } else {
            $isHousehold = $request->boolean('is_household');

            // Link partner diverifikasi lebih dulu: kalau sudah lolos OTP, biodata diambil
            // dari Master Identity partner sehingga form isian tidak perlu diisi ulang.
            $linkPartner = null;

            if ($request->input('is_partner') === 'yes') {
                $linkPartner = $this->verifiedLinkPartner($request);

                if (! $linkPartner) {
                    return back()->withErrors([
                        'partner_email' => 'Verifikasi OTP ke email partner terlebih dahulu sebelum mengirim formulir.',
                    ])->withInput();
                }

                $request->merge($this->biodataFromPartner($linkPartner));

                if (blank($request->input('email'))) {
                    $request->merge(['email' => $linkPartner->email ?? $linkPartner->user?->email]);
                }
            }

            $relaxBiodata = $linkPartner !== null;

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

            // Turunkan field legacy (kompatibel dengan layar admin & profil).
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

            $request->merge([
                'is_household' => $isHousehold,
                'companies' => $businesses,
                'company' => ! empty($formattedCompanyParts) ? implode(', ', $formattedCompanyParts) : null,
                'industry' => ! empty($extractedIndustries) ? implode(', ', $extractedIndustries) : null,
                'business_fields' => ! empty($extractedFields) ? $extractedFields : null,
                'business_address' => $businesses[0]['address'] ?? null,
            ]);

            // Rumah tangga ATAU biodata dipinjam dari Master Identity → isian usaha tidak wajib.
            $relax = $isHousehold || $relaxBiodata;

            $request->validate([
                'role' => 'required|in:member,partner',
                'email' => [
                    'required',
                    'string',
                    'lowercase',
                    'email',
                    'max:255',
                    Rule::unique('users', 'email')->where('role', User::ROLE_MEMBER),
                ],
                'name' => 'required|string|max:255',
                'nickname' => 'nullable|string|max:100',
                'gender' => 'nullable|string|max:50',
                'birth_date' => 'nullable|date',
                'birth_place' => 'nullable|string|max:100',
                'hobbies' => 'nullable|array',
                'marital_status' => 'nullable|string|max:50',
                'religion' => 'nullable|string|max:100',
                'place_of_worship_address' => 'nullable|string|max:500',
                'phone' => 'nullable|string|max:30',
                'address' => 'nullable|string|max:500',
                'district' => 'nullable|string|max:100',
                'city' => 'nullable|string|max:100',
                'is_household' => 'boolean',
                'companies' => ($relax ? 'nullable' : 'required').'|array'.($relax ? '' : '|min:1'),
                'companies.*.company' => ($relax ? 'nullable' : 'required').'|string|max:255',
                'companies.*.industry' => ($relax ? 'nullable' : 'required').'|string|max:100',
                'companies.*.position' => ($relax ? 'nullable' : 'required').'|string|max:100',
                'companies.*.address' => 'nullable|string|max:500',
                'business_fields' => ($relax ? 'nullable' : 'required').'|array'.($relax ? '' : '|min:1'),
                'business_fields.*' => 'required|string|max:100',
                'company' => 'nullable|string|max:255',
                'business_address' => 'nullable|string|max:500',
                'business_district' => 'nullable|string|max:100',
                'business_city' => 'nullable|string|max:100',
                'industry' => $relax ? 'nullable|string|max:255' : 'required|string|max:255',
                // "Are you a Partner?" → link partner wajib lewat OTP dulu.
                'is_partner' => 'nullable|in:yes,no',
                'partner_email' => 'nullable|required_if:is_partner,yes|email|max:255',
            ], [
                'companies.required' => 'Silakan isi minimal 1 info usaha atau centang "Bapak/Ibu Rumah Tangga".',
                'companies.min' => 'Silakan isi minimal 1 info usaha atau centang "Bapak/Ibu Rumah Tangga".',
                'companies.*.company.required' => 'Nama perusahaan wajib diisi.',
                'companies.*.industry.required' => 'Bidang industri wajib dipilih.',
                'companies.*.position.required' => 'Jabatan wajib diisi.',
                'business_fields.required' => 'Bidang usaha wajib diisi minimal 1.',
                'business_fields.min' => 'Bidang usaha wajib diisi minimal 1.',
                'industry.required' => 'Bidang industri wajib dipilih minimal 1.',
            ]);

            $industryString = $request->input('industry');
            if (! $relax && empty(trim((string) $industryString))) {
                return back()->withErrors(['industry' => 'Bidang industri wajib dipilih minimal 1.'])->withInput();
            }

            // Member baru yang terhubung ke partner memakai Master Identity partner
            // (1 identity menaungi partner & member-nya), bukan membuat identity baru.
            $linkedIdentity = $linkPartner?->masterIdentity ?? $linkPartner?->user?->masterIdentity;
            $identityEmail = $linkPartner
                ? ($linkPartner->email ?? $linkPartner->user?->email)
                : $request->email;

            $identity = $linkedIdentity ?: MasterIdentity::forEmail($identityEmail, [
                'name' => $request->name,
                'phone' => $request->phone,
                'birth_date' => $request->birth_date,
                'birth_place' => $request->birth_place,
                'gender' => $request->gender,
                'religion' => $request->religion,
                'marital_status' => $request->marital_status,
                'address' => $request->address,
                'city' => $request->city,
                'district' => $request->district,
                'hobbies' => $request->hobbies,
            ]);

            $user = User::create([
                'name' => $request->name,
                'nickname' => $request->nickname,
                'email' => $request->email,
                'phone' => $request->phone,
                'whatsapp' => $request->phone,
                'gender' => $request->gender,
                'birth_date' => $request->birth_date,
                'birth_place' => $request->birth_place,
                'hobbies' => $request->hobbies,
                'marital_status' => $request->marital_status,
                'religion' => $request->religion,
                'place_of_worship_address' => $request->place_of_worship_address,
                'address' => $request->address,
                'district' => $request->district,
                'city' => $request->city,
                'company' => $request->company,
                'business_fields' => $request->business_fields,
                'business_address' => $request->business_address,
                'business_district' => $request->business_district,
                'business_city' => $request->business_city,
                'businesses' => ! empty($businesses) ? $businesses : null,
                'is_household' => $isHousehold,
                'industry' => $industryString,
                'password' => Hash::make(Str::random(40)),
                'role' => User::ROLE_MEMBER,
                'approval_status' => User::APPROVAL_PENDING,
                'must_change_password' => true,
                'master_identity_id' => $identity?->id,
            ]);

            // Otomatis link partner yang sudah lolos OTP ke member baru ini.
            if ($linkPartner) {
                // Samakan Master Identity partner ↔ member bila partner belum punya identity.
                if ($identity && ! $linkPartner->master_identity_id) {
                    $linkPartner->forceFill(['master_identity_id' => $identity->id])->save();
                }
                $linkedVendor = $linkPartner->user;

                if ($identity && $linkedVendor && ! $linkedVendor->master_identity_id) {
                    $linkedVendor->forceFill(['master_identity_id' => $identity->id])->save();
                }

                $linkPartner->forceFill([
                    'member_user_id' => $user->id,
                    'is_member' => true,
                    'member_id_number' => $user->member_code,
                    'member_name' => $user->name,
                ])->save();
            }
        }

        $request->session()->forget(['partner_link_email', 'partner_link_partner_id', 'partner_link_verified_partner_id']);

        event(new Registered($user));

        if ($roleInput === 'partner') {
            // OTP verifikasi email PIC partner sebelum menunggu approval admin.
            $this->otp->issue(
                $user,
                PasswordOtpService::PURPOSE_PARTNER_REGISTER,
                'Verifikasi Email Partner KBKB',
                'Masukkan kode OTP 6 digit untuk menyelesaikan pendaftaran partner Anda.'
            );

            $request->session()->put('partner_otp_user_id', $user->id);

            return redirect()->route('partner.otp.show');
        }

        return Inertia::render('Auth/RegisterSuccess', [
            'name' => $user->name,
            'email' => $user->email,
            'role' => $roleInput,
        ]);
    }

    /**
     * Biodata partner (Master Identity → fallback profile partner/user) untuk
     * mengisi pendaftaran member tanpa mengetik ulang data identitas.
     */
    private function biodataFromPartner(Partner $partner): array
    {
        $identity = $partner->masterIdentity ?? $partner->user?->masterIdentity;
        $user = $partner->user;
        $pick = fn (string $key) => $identity?->{$key} ?? $user?->{$key};

        $biodata = [
            'name' => $identity?->name ?? $partner->pic_name ?? $user?->name ?? $partner->name,
            'nickname' => $user?->nickname,
            'phone' => $identity?->phone ?? $user?->phone ?? $partner->pic_phone ?? $partner->phone,
            'address' => $identity?->address ?? $user?->address,
            'district' => $identity?->district ?? $user?->district,
            'city' => $identity?->city ?? $user?->city,
            'gender' => $pick('gender'),
            'birth_date' => $pick('birth_date'),
            'birth_place' => $pick('birth_place'),
            'marital_status' => $pick('marital_status'),
            'religion' => $pick('religion'),
            'place_of_worship_address' => $pick('place_of_worship_address'),
            'hobbies' => $identity?->hobbies ?? $user?->hobbies,
        ];

        if (! empty($biodata['birth_date'])) {
            $biodata['birth_date'] = Carbon::parse($biodata['birth_date'])->toDateString();
        }

        $biodata = array_filter($biodata, fn ($value) => $value !== null && $value !== '');

        // Form biodata disingkirkan → isian usaha tidak ada.
        $biodata['companies'] = [];
        $biodata['business_fields'] = null;
        $biodata['industry'] = null;

        return $biodata;
    }

    /**
     * Partner yang sudah diverifikasi OTP-nya untuk registrasi member ini.
     */
    private function verifiedLinkPartner(Request $request): ?Partner
    {
        $partnerId = $request->session()->get('partner_link_verified_partner_id');

        if (! $partnerId) {
            return null;
        }

        $partner = Partner::query()->find($partnerId);

        if (! $partner) {
            return null;
        }

        $requestedEmail = (string) $request->input('partner_email');
        $partnerEmail = (string) ($partner->email ?? $partner->user?->email);

        if ($requestedEmail === '' || strcasecmp($requestedEmail, $partnerEmail) !== 0) {
            return null;
        }

        // Tolak keras jika partner sudah terhubung ke member lain.
        if ($partner->member_user_id !== null) {
            return null;
        }

        return $partner;
    }
}
