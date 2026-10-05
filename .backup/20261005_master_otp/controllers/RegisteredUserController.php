<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use App\Models\User;
use App\Support\PartnerCategory;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
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
            $isMember = $request->boolean('is_member');

            $rules = [
                'role' => 'required|in:member,partner',
                'name' => 'required|string|max:255', // Nama Perusahaan
                'trade_name' => 'required|string|max:255', // Nama Merk Dagang
                'address' => 'required|string|max:500', // Alamat Usaha
                'phone' => 'required|string|max:30', // Nomor Telfon
                'email' => 'required|string|lowercase|email|max:255|unique:'.User::class.',email',
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
            ]);
        } else {
            $isHousehold = $request->boolean('is_household');

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
                'is_household' => 'boolean',
                'companies' => ($isHousehold ? 'nullable' : 'required').'|array'.($isHousehold ? '' : '|min:1'),
                'companies.*.company' => ($isHousehold ? 'nullable' : 'required').'|string|max:255',
                'companies.*.industry' => ($isHousehold ? 'nullable' : 'required').'|string|max:100',
                'companies.*.position' => ($isHousehold ? 'nullable' : 'required').'|string|max:100',
                'companies.*.address' => 'nullable|string|max:500',
                'business_fields' => ($isHousehold ? 'nullable' : 'required').'|array'.($isHousehold ? '' : '|min:1'),
                'business_fields.*' => 'required|string|max:100',
                'company' => 'nullable|string|max:255',
                'business_address' => 'nullable|string|max:500',
                'business_district' => 'nullable|string|max:100',
                'business_city' => 'nullable|string|max:100',
                'industry' => $isHousehold ? 'nullable|string|max:255' : 'required|string|max:255',
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
            if (! $isHousehold && empty(trim((string) $industryString))) {
                return back()->withErrors(['industry' => 'Bidang industri wajib dipilih minimal 1.'])->withInput();
            }

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
            ]);
        }

        event(new Registered($user));

        return Inertia::render('Auth/RegisterSuccess', [
            'name' => $user->name,
            'email' => $user->email,
            'role' => $roleInput,
        ]);
    }
}
