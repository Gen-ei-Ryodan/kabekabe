<?php

namespace App\Http\Controllers\Partner;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use App\Models\User;
use App\Support\PartnerCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
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
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
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
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'],
                'role' => User::ROLE_VENDOR,
                'phone' => $validated['phone'] ?? null,
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
                'is_active' => true,
            ]);

            DB::commit();

            return redirect()->route('partner.register.thankyou');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors(['email' => 'Registration failed. Please try again.'])->withInput();
        }
    }

    public function thankyou(): Response
    {
        return Inertia::render('Partner/ThankYou');
    }
}
