import { useState } from "react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import { HOBBY_LIST, INDUSTRY_CATEGORIES } from "@/constants/membership";

/**
 * 4 section Form Master Identity / Master Biodata (Data Pribadi,
 * Domisili, Usaha & Pekerjaan, Minat & Hobi).
 * Dipakai identik di registrasi Member dan registrasi Partner
 * ketika calon pengguna belum punya akun lain.
 */
export default function MasterIdentityBiodata({
    data,
    setData,
    errors,
    showEmail = true,
}) {
    const [hobbySearch, setHobbySearch] = useState("");
    const [customHobbyInput, setCustomHobbyInput] = useState("");

    const toggleHobby = (hobby) => {
        if (data.hobbies.includes(hobby)) {
            setData(
                "hobbies",
                data.hobbies.filter((h) => h !== hobby),
            );
        } else {
            setData("hobbies", [...data.hobbies, hobby]);
        }
    };

    const addCustomHobby = () => {
        const trimmed = customHobbyInput.trim();
        if (trimmed && !data.hobbies.includes(trimmed)) {
            setData("hobbies", [...data.hobbies, trimmed]);
            setCustomHobbyInput("");
        }
    };

    const addCompany = () => {
        setData("companies", [
            ...data.companies,
            { company: "", industry: "", position: "", address: "" },
        ]);
    };

    const removeCompany = (index) => {
        if (data.companies.length <= 1) return;
        setData(
            "companies",
            data.companies.filter((_, i) => i !== index),
        );
    };

    const updateCompany = (index, field, value) => {
        const updated = data.companies.map((item, i) => {
            if (i === index) {
                return { ...item, [field]: value };
            }
            return item;
        });
        setData("companies", updated);
    };

    const filteredHobbies = HOBBY_LIST.filter((h) =>
        h.toLowerCase().includes(hobbySearch.toLowerCase()),
    );

    return (
        <>
            {/* 1. DATA AKUN & PRIBADI */}
            <section className="rounded-2xl border border-ink/10 bg-white/50 p-5 sm:p-6 space-y-4">
                <div className="border-b border-ink/10 pb-3">
                    <h2 className="font-display text-base font-bold text-ink flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-deep">
                            1
                        </span>
                        Data Akun & Pribadi
                    </h2>
                    <p className="text-xs text-slate mt-0.5">
                        Informasi identitas dasar untuk
                        profil keanggotaan Anda.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {showEmail && (
                    <div className="sm:col-span-2">
                        <InputLabel
                            htmlFor="email"
                            value="Alamat Email *"
                        />
                        <TextInput
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) =>
                                setData(
                                    "email",
                                    e.target.value,
                                )
                            }
                            className="mt-1 block w-full"
                            placeholder="nama@email.com"
                            required
                        />
                        <InputError
                            message={errors.email}
                            className="mt-1"
                        />
                    </div>
                    )}

                    <div>
                        <InputLabel
                            htmlFor="name"
                            value="Nama Lengkap *"
                        />
                        <TextInput
                            id="name"
                            value={data.name}
                            onChange={(e) =>
                                setData(
                                    "name",
                                    e.target.value,
                                )
                            }
                            className="mt-1 block w-full"
                            placeholder="Nama sesuai KTP"
                            required
                        />
                        <InputError
                            message={errors.name}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="nickname"
                            value="Nama Panggilan"
                        />
                        <TextInput
                            id="nickname"
                            value={data.nickname}
                            onChange={(e) =>
                                setData(
                                    "nickname",
                                    e.target.value,
                                )
                            }
                            className="mt-1 block w-full"
                            placeholder="Contoh: Alex, Sari"
                        />
                        <InputError
                            message={errors.nickname}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="gender"
                            value="Jenis Kelamin"
                        />
                        <select
                            id="gender"
                            value={data.gender}
                            onChange={(e) =>
                                setData(
                                    "gender",
                                    e.target.value,
                                )
                            }
                            className="mt-1 block w-full rounded-xl border-ink/20 bg-white/90 px-3 py-2.5 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                        >
                            <option value="">
                                Pilih Jenis Kelamin...
                            </option>
                            <option value="Pria">
                                Pria
                            </option>
                            <option value="Wanita">
                                Wanita
                            </option>
                        </select>
                        <InputError
                            message={errors.gender}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="phone"
                            value="No. WhatsApp / Telepon *"
                        />
                        <TextInput
                            id="phone"
                            type="tel"
                            value={data.phone}
                            onChange={(e) =>
                                setData(
                                    "phone",
                                    e.target.value,
                                )
                            }
                            className="mt-1 block w-full"
                            placeholder="081234567890"
                        />
                        <InputError
                            message={errors.phone}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="birth_date"
                            value="Tanggal Lahir"
                        />
                        <TextInput
                            id="birth_date"
                            type="date"
                            value={data.birth_date}
                            onChange={(e) =>
                                setData(
                                    "birth_date",
                                    e.target.value,
                                )
                            }
                            className="mt-1 block w-full"
                        />
                        <InputError
                            message={errors.birth_date}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="birth_place"
                            value="Kota Kelahiran"
                        />
                        <TextInput
                            id="birth_place"
                            value={data.birth_place}
                            onChange={(e) =>
                                setData(
                                    "birth_place",
                                    e.target.value,
                                )
                            }
                            className="mt-1 block w-full"
                            placeholder="Contoh: Denpasar, Surabaya, Jakarta"
                        />
                        <InputError
                            message={errors.birth_place}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="marital_status"
                            value="Status Pernikahan"
                        />
                        <select
                            id="marital_status"
                            value={data.marital_status}
                            onChange={(e) =>
                                setData(
                                    "marital_status",
                                    e.target.value,
                                )
                            }
                            className="mt-1 block w-full rounded-xl border-ink/20 bg-white/90 px-3 py-2.5 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                        >
                            <option value="">
                                Pilih Status...
                            </option>
                            <option value="Belum Menikah">
                                Belum Menikah
                            </option>
                            <option value="Menikah">
                                Menikah
                            </option>
                            <option value="Pernah Menikah">
                                Pernah Menikah
                            </option>
                        </select>
                        <InputError
                            message={errors.marital_status}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="religion"
                            value="Agama"
                        />
                        <select
                            id="religion"
                            value={data.religion}
                            onChange={(e) =>
                                setData(
                                    "religion",
                                    e.target.value,
                                )
                            }
                            className="mt-1 block w-full rounded-xl border-ink/20 bg-white/90 px-3 py-2.5 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                        >
                            <option value="">
                                Pilih Agama...
                            </option>
                            <option value="Katolik">
                                Katolik
                            </option>
                            <option value="Kristen">
                                Kristen
                            </option>
                            <option value="Islam">
                                Islam
                            </option>
                            <option value="Buddha">
                                Buddha
                            </option>
                            <option value="Hindu">
                                Hindu
                            </option>
                            <option value="Konghucu">
                                Konghucu
                            </option>
                            <option value="Lainnya">
                                Lainnya
                            </option>
                        </select>
                        <InputError
                            message={errors.religion}
                            className="mt-1"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <InputLabel
                            htmlFor="place_of_worship_address"
                            value="Paroki Gereja / Alamat Tempat Ibadah"
                        />
                        <TextInput
                            id="place_of_worship_address"
                            value={
                                data.place_of_worship_address
                            }
                            onChange={(e) =>
                                setData(
                                    "place_of_worship_address",
                                    e.target.value,
                                )
                            }
                            className="mt-1 block w-full"
                            placeholder="Contoh: Paroki FX Kuta, GBI Rock, dll."
                        />
                        <InputError
                            message={
                                errors.place_of_worship_address
                            }
                            className="mt-1"
                        />
                    </div>
                </div>
            </section>

            {/* 2. DOMISILI / TEMPAT TINGGAL */}
            <section className="rounded-2xl border border-ink/10 bg-white/50 p-5 sm:p-6 space-y-4">
                <div className="border-b border-ink/10 pb-3">
                    <h2 className="font-display text-base font-bold text-ink flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-deep">
                            2
                        </span>
                        Domisili / Tempat Tinggal
                    </h2>
                    <p className="text-xs text-slate mt-0.5">
                        Alamat tempat tinggal Anda saat ini.
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <InputLabel
                            htmlFor="address"
                            value="Alamat Tempat Tinggal"
                        />
                        <textarea
                            id="address"
                            rows={2}
                            value={data.address}
                            onChange={(e) =>
                                setData(
                                    "address",
                                    e.target.value,
                                )
                            }
                            className="mt-1 block w-full rounded-xl border-ink/20 bg-white/90 p-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                            placeholder="Jalan, No. Rumah, RT/RW, Kelurahan/Desa"
                        />
                        <InputError
                            message={errors.address}
                            className="mt-1"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <InputLabel
                                htmlFor="district"
                                value="Kecamatan Tempat Tinggal"
                            />
                            <TextInput
                                id="district"
                                value={data.district}
                                onChange={(e) =>
                                    setData(
                                        "district",
                                        e.target.value,
                                    )
                                }
                                className="mt-1 block w-full"
                                placeholder="Contoh: Kuta, Sanur, Denpasar Selatan"
                            />
                            <InputError
                                message={errors.district}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="city"
                                value="Kota / Kabupaten Tempat Tinggal"
                            />
                            <TextInput
                                id="city"
                                value={data.city}
                                onChange={(e) =>
                                    setData(
                                        "city",
                                        e.target.value,
                                    )
                                }
                                className="mt-1 block w-full"
                                placeholder="Contoh: Denpasar, Badung, Gianyar"
                            />
                            <InputError
                                message={errors.city}
                                className="mt-1"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. PEKERJAAN & USAHA */}
            <section className="rounded-2xl border border-ink/10 bg-white/50 p-5 sm:p-6 space-y-4">
                <div className="border-b border-ink/10 pb-3">
                    <h2 className="font-display text-base font-bold text-ink flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-deep">
                            3
                        </span>
                        Informasi Usaha & Pekerjaan
                    </h2>
                    <p className="text-xs text-slate mt-0.5">
                        Bidang bisnis atau instansi tempat
                        Anda beraktivitas.
                    </p>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink/15 bg-white/80 p-3.5 shadow-sm">
                    <input
                        type="checkbox"
                        checked={data.is_household}
                        onChange={(e) =>
                            setData(
                                "is_household",
                                e.target.checked,
                            )
                        }
                        className="mt-0.5 h-4 w-4 rounded border-ink/30 text-gold-deep focus:ring-gold"
                    />
                    <span className="text-sm leading-snug text-ink">
                        <span className="font-semibold">
                            Bapak / Ibu Rumah Tangga
                        </span>
                        <span className="mt-0.5 block text-xs text-slate">
                            Jika dicentang, bagian informasi
                            usaha & pekerjaan tidak perlu
                            diisi.
                        </span>
                    </span>
                </label>

                {data.is_household && (
                    <div className="rounded-xl border border-gold/30 bg-gold/10 p-4 text-xs leading-relaxed text-slate">
                        Informasi usaha & pekerjaan tidak
                        diperlukan untuk Bapak/Ibu Rumah
                        Tangga. Silakan lanjut ke bagian
                        berikutnya.
                    </div>
                )}

                {!data.is_household && (
                    <div className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <InputLabel value="Usaha / Pekerjaan * (Minimal 1)" />
                                <button
                                    type="button"
                                    onClick={addCompany}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-deep hover:text-ink transition-colors"
                                >
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/20 text-xs font-bold">
                                        +
                                    </span>
                                    Tambah Perusahaan
                                </button>
                            </div>

                            {data.companies.map(
                                (comp, idx) => (
                                    <div
                                        key={idx}
                                        className="relative rounded-xl border border-ink/15 bg-white/80 p-4 shadow-sm space-y-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-ink/70">
                                                Perusahaan #
                                                {idx + 1}
                                            </span>
                                            {data.companies
                                                .length >
                                                1 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeCompany(
                                                            idx,
                                                        )
                                                    }
                                                    className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                                                >
                                                    ✕ Hapus
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div>
                                                <InputLabel
                                                    htmlFor={`company_${idx}`}
                                                    value="Nama Perusahaan / Tempat Kerja *"
                                                />
                                                <TextInput
                                                    id={`company_${idx}`}
                                                    value={
                                                        comp.company
                                                    }
                                                    onChange={(
                                                        e,
                                                    ) =>
                                                        updateCompany(
                                                            idx,
                                                            "company",
                                                            e
                                                                .target
                                                                .value,
                                                        )
                                                    }
                                                    className="mt-1 block w-full"
                                                    placeholder="Contoh: PT Sukses Mandiri"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <InputLabel
                                                    htmlFor={`industry_${idx}`}
                                                    value="Bidang Industri *"
                                                />
                                                <select
                                                    id={`industry_${idx}`}
                                                    value={
                                                        comp.industry
                                                    }
                                                    onChange={(
                                                        e,
                                                    ) =>
                                                        updateCompany(
                                                            idx,
                                                            "industry",
                                                            e
                                                                .target
                                                                .value,
                                                        )
                                                    }
                                                    className="mt-1 block w-full rounded-xl border-ink/20 bg-white/90 px-3 py-2.5 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                                                    required
                                                >
                                                    <option value="">
                                                        Pilih
                                                        Bidang
                                                        Industri...
                                                    </option>
                                                    {INDUSTRY_CATEGORIES.map(
                                                        (
                                                            cat,
                                                        ) => (
                                                            <option
                                                                key={
                                                                    cat
                                                                }
                                                                value={
                                                                    cat
                                                                }
                                                            >
                                                                {
                                                                    cat
                                                                }
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            </div>

                                            <div>
                                                <InputLabel
                                                    htmlFor={`position_${idx}`}
                                                    value="Jabatan *"
                                                />
                                                <TextInput
                                                    id={`position_${idx}`}
                                                    value={
                                                        comp.position
                                                    }
                                                    onChange={(
                                                        e,
                                                    ) =>
                                                        updateCompany(
                                                            idx,
                                                            "position",
                                                            e
                                                                .target
                                                                .value,
                                                        )
                                                    }
                                                    className="mt-1 block w-full"
                                                    placeholder="Contoh: Direktur, Manajer, Wiraswasta"
                                                    required
                                                />
                                            </div>

                                            <div className="sm:col-span-2">
                                                <InputLabel
                                                    htmlFor={`company_address_${idx}`}
                                                    value="Alamat"
                                                />
                                                <textarea
                                                    id={`company_address_${idx}`}
                                                    rows={2}
                                                    value={
                                                        comp.address
                                                    }
                                                    onChange={(
                                                        e,
                                                    ) =>
                                                        updateCompany(
                                                            idx,
                                                            "address",
                                                            e
                                                                .target
                                                                .value,
                                                        )
                                                    }
                                                    className="mt-1 block w-full rounded-xl border-ink/20 bg-white/90 p-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                                                    placeholder="Alamat perusahaan / tempat usaha..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ),
                            )}

                            <InputError
                                message={errors.companies}
                                className="mt-1"
                            />
                            <InputError
                                message={errors.company}
                                className="mt-1"
                            />
                            <InputError
                                message={errors.industry}
                                className="mt-1"
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel
                                    htmlFor="business_district"
                                    value="Kecamatan Usaha"
                                />
                                <TextInput
                                    id="business_district"
                                    value={
                                        data.business_district
                                    }
                                    onChange={(e) =>
                                        setData(
                                            "business_district",
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1 block w-full"
                                    placeholder="Kecamatan kantor"
                                />
                                <InputError
                                    message={
                                        errors.business_district
                                    }
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="business_city"
                                    value="Kota / Kabupaten Usaha"
                                />
                                <TextInput
                                    id="business_city"
                                    value={
                                        data.business_city
                                    }
                                    onChange={(e) =>
                                        setData(
                                            "business_city",
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1 block w-full"
                                    placeholder="Kota/Kabupaten kantor"
                                />
                                <InputError
                                    message={
                                        errors.business_city
                                    }
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* 4. HOBI & KESUKAAN */}
            <section className="rounded-2xl border border-ink/10 bg-white/50 p-5 sm:p-6 space-y-4">
                <div className="border-b border-ink/10 pb-3">
                    <h2 className="font-display text-base font-bold text-ink flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-deep">
                            4
                        </span>
                        Hobi & Kesukaan
                    </h2>
                    <p className="text-xs text-slate mt-0.5">
                        Pilih minat atau hobi untuk
                        memudahkan networking dengan sesama
                        anggota komunitas.
                    </p>
                </div>

                {/* Terpilih */}
                <div>
                    <InputLabel
                        value={`Hobi Terpilih (${data.hobbies.length})`}
                        className="mb-1.5"
                    />
                    {data.hobbies.length === 0 ? (
                        <p className="text-xs italic text-slate">
                            Belum ada hobi yang dipilih.
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-1.5">
                            {data.hobbies.map((h) => (
                                <span
                                    key={h}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-deep"
                                >
                                    {h}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            toggleHobby(h)
                                        }
                                        className="hover:text-ember ml-1"
                                    >
                                        ✕
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Search box & filterable list */}
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <TextInput
                            type="text"
                            value={hobbySearch}
                            onChange={(e) =>
                                setHobbySearch(
                                    e.target.value,
                                )
                            }
                            placeholder="Cari dari 58 pilihan hobi (misal: Bulutangkis, Golf, Memasak)..."
                            className="flex-1 text-xs"
                        />
                        {hobbySearch && (
                            <button
                                type="button"
                                onClick={() =>
                                    setHobbySearch("")
                                }
                                className="btn-ghost text-xs px-3"
                            >
                                Reset
                            </button>
                        )}
                    </div>

                    <div className="max-h-48 overflow-y-auto rounded-xl border border-ink/10 bg-white/80 p-3">
                        <div className="flex flex-wrap gap-1.5">
                            {filteredHobbies.map((h) => {
                                const isSelected =
                                    data.hobbies.includes(
                                        h,
                                    );
                                return (
                                    <button
                                        key={h}
                                        type="button"
                                        onClick={() =>
                                            toggleHobby(h)
                                        }
                                        className={`rounded-lg border px-2.5 py-1 text-xs transition-all ${
                                            isSelected
                                                ? "border-gold bg-gold/20 text-gold-deep font-semibold shadow-xs"
                                                : "border-ink/10 bg-white text-slate hover:border-gold/50 hover:text-ink"
                                        }`}
                                    >
                                        {isSelected
                                            ? "✓ "
                                            : "+ "}
                                        {h}
                                    </button>
                                );
                            })}
                            {filteredHobbies.length ===
                                0 && (
                                <p className="text-xs text-slate py-1">
                                    Tidak ditemukan pilihan
                                    hobi yang sesuai.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Opsi Custom Hobby Lainnya */}
                <div className="border-t border-ink/10 pt-3">
                    <InputLabel value="Lainnya (sebutkan hobi khusus jika belum tersedia di atas)" />
                    <div className="mt-1.5 flex gap-2">
                        <TextInput
                            value={customHobbyInput}
                            onChange={(e) =>
                                setCustomHobbyInput(
                                    e.target.value,
                                )
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    addCustomHobby();
                                }
                            }}
                            placeholder="Ketik nama hobi lainnya..."
                            className="flex-1"
                        />
                        <button
                            type="button"
                            onClick={addCustomHobby}
                            className="btn-ink text-xs px-4 py-2"
                        >
                            + Tambah
                        </button>
                    </div>
                </div>
            </section>
        </>
    );
}
