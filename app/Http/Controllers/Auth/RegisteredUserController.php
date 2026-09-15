<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
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
            $request->validate([
                'role' => 'required|in:member,partner',
                'name' => 'required|string|max:255',
                'pic_name' => 'required|string|max:255',
                'pic_phone' => 'required|string|max:30',
                'category' => 'nullable|string|max:100',
                'phone' => 'nullable|string|max:30',
                'email' => 'required|string|lowercase|email|max:255|unique:'.User::class.',email',
                'address' => 'nullable|string|max:500',
                'district' => 'nullable|string|max:100',
                'city' => 'nullable|string|max:100',
                'industry' => 'nullable|string|max:150',
                'employee_count' => 'nullable|integer|min:1',
                'established_since' => 'nullable|string|max:4',
                'is_member' => 'nullable|boolean',
                'member_code' => 'nullable|string|max:50',
                'member_name' => 'nullable|string|max:255',
                'member_birth_date' => 'nullable|date',
                'hobbies' => 'nullable|array',
                'hobbies.*' => 'string|max:100',
            ]);

            $generatedPassword = 'KBKB' . random_int(1000, 9999);

            $user = User::create([
                'name' => $request->pic_name,
                'email' => $request->email,
                'phone' => $request->pic_phone,
                'whatsapp' => $request->pic_phone,
                'company' => $request->name,
                'address' => $request->address,
                'district' => $request->district,
                'city' => $request->city,
                'industry' => $request->industry,
                'password' => Hash::make($generatedPassword),
                'role' => User::ROLE_VENDOR,
                'approval_status' => User::APPROVAL_PENDING,
                'must_change_password' => true,
            ]);

            $user->partner()->create([
                'name' => $request->name,
                'slug' => Partner::slugFor($request->name),
                'pic_name' => $request->pic_name,
                'pic_phone' => $request->pic_phone,
                'category' => $request->category ?: ($request->industry ?: 'Umum'),
                'phone' => $request->phone ?: $request->pic_phone,
                'email' => $request->email,
                'address' => $request->address,
                'district' => $request->district,
                'city' => $request->city,
                'industry' => $request->industry,
                'employee_count' => $request->employee_count,
                'established_since' => $request->established_since,
                'is_member' => $request->boolean('is_member'),
                'member_code' => $request->member_code,
                'hobbies' => $request->hobbies,
                'date_of_birth' => $request->member_birth_date,
                'joined_at' => now(),
                'is_active' => false,
                'status' => Partner::STATUS_INACTIVE,
            ]);

            // If member info provided, optionally update user birth_date
            if ($request->filled('member_birth_date')) {
                $user->update(['birth_date' => $request->member_birth_date]);
            }
            if ($request->filled('member_name')) {
                // keep pic_name as is, no extra action
            }
        } else {
            $request->validate([
                'role' => 'required|in:member,partner',
                'email' => 'required|string|lowercase|email|max:255|unique:'.User::class.',email',
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
                'business_fields' => 'nullable|array',
                'company' => 'nullable|string|max:255',
                'business_address' => 'nullable|string|max:500',
                'business_district' => 'nullable|string|max:100',
                'business_city' => 'nullable|string|max:100',
                'industry' => 'nullable|string|max:150',
            ]);

            $generatedPassword = 'KBKB' . random_int(1000, 9999);

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
                'industry' => $request->industry,
                'password' => Hash::make($generatedPassword),
                'role' => User::ROLE_MEMBER,
                'approval_status' => User::APPROVAL_PENDING,
                'must_change_password' => true,
            ]);
        }

        event(new Registered($user));

        return Inertia::render('Auth/RegisterSuccess', [
            'name' => $user->name,
            'email' => $user->email,
            'role' => $roleInput,
            'generatedPassword' => $generatedPassword,
        ]);
    }
}
