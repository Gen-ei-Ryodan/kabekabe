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
        $validated = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'company_address' => ['nullable', 'string', 'max:1000'],
            'company_phone' => ['nullable', 'string', 'max:30'],
            'employee_count' => ['nullable', 'integer', 'min:1'],
            'established_since' => ['nullable', 'string', 'max:4'],
            'pic_name' => ['required', 'string', 'max:255'],
            'pic_phone' => ['required', 'string', 'max:30'],
            'is_member' => ['required', 'boolean'],
            'member_code' => ['nullable', 'string', 'max:20'],
            'name' => ['required', 'string', 'max:255'],
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

        if ($validated['is_member'] && ! empty($validated['member_code'])) {
            $memberExists = User::where('role', User::ROLE_MEMBER)
                ->where('member_code', $validated['member_code'])
                ->exists();

            if (! $memberExists) {
                return back()->withErrors(['member_code' => 'Member code not found.'])->withInput();
            }
        }

        DB::beginTransaction();

        try {
            $identity = MasterIdentity::forEmail($validated['email'], [
                'name' => $validated['name'],
                'phone' => $validated['phone'] ?? null,
                'birth_date' => $validated['date_of_birth'] ?? null,
            ]);

            $user = User::create([
                'name' => $validated['name'],
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
                'pic_name' => $validated['pic_name'],
                'pic_phone' => $validated['pic_phone'],
                'is_member' => $validated['is_member'],
                'member_code' => $validated['is_member'] ? ($validated['member_code'] ?? null) : null,
                'industry' => $industryString,
                'hobbies' => $validated['hobbies'] ?? null,
                'date_of_birth' => $validated['date_of_birth'] ?? null,
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
