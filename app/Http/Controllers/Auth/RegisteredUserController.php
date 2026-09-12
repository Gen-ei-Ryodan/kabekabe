<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
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
     *
     * @throws ValidationException
     */
    public function store(Request $request): Response|RedirectResponse
    {
        $request->validate([
            'role' => 'required|in:member,partner',
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'partner_category' => 'required_if:role,partner|nullable|string|max:100',
        ]);

        $generatedPassword = 'KBKB' . random_int(1000, 9999);
        $role = $request->role === 'partner' ? User::ROLE_VENDOR : User::ROLE_MEMBER;

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'whatsapp' => $request->phone,
            'address' => $request->address,
            'password' => Hash::make($generatedPassword),
            'role' => $role,
            'approval_status' => User::APPROVAL_PENDING,
            'must_change_password' => true,
        ]);

        if ($role === User::ROLE_VENDOR) {
            $user->partner()->create([
                'name' => $request->name,
                'slug' => \App\Models\Partner::slugFor($request->name),
                'category' => $request->partner_category ?: 'Umum',
                'address' => $request->address,
                'phone' => $request->phone,
                'email' => $request->email,
                'is_active' => false,
                'status' => \App\Models\Partner::STATUS_INACTIVE,
            ]);
        }

        event(new Registered($user));

        return Inertia::render('Auth/RegisterSuccess', [
            'name' => $user->name,
            'email' => $user->email,
            'role' => $request->role,
            'generatedPassword' => $generatedPassword,
        ]);
    }
}
