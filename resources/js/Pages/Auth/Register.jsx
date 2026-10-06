import { useState } from "react";
import InputError from "@/Components/InputError";
import MasterIdentityBiodata from "@/Components/MasterIdentityBiodata";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import {
    HOBBY_LIST,
    INDUSTRY_CATEGORIES,
    derivePartnerCategory,
} from "@/constants/membership";

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        role: "member",
        // Common
        email: "",
        name: "",
        phone: "",
        address: "",
        district: "",
        city: "",
        // Member specific
        nickname: "",
        gender: "",
        birth_date: "",
        birth_place: "",
        marital_status: "",
        religion: "",
        place_of_worship_address: "",
        company: "",
        is_household: false,
        companies: [{ company: "", industry: "", position: "", address: "" }],
        business_fields: [],
        business_district: "",
        business_city: "",
        industry: [],
        hobbies: [],
        is_partner: "no",
        partner_email: "",
        // Partner specific
        pic_name: "",
        pic_phone: "",
        category: "F&B",
        trade_name: "",
        employee_count: "",
        established_since: "",
        is_member: false,
        member_id_number: "",
        member_name: "",
        member_birth_date: "",
        member_phone: "",
        member_address: "",
        member_district: "",
        member_city: "",
    });

    const [hobbySearch, setHobbySearch] = useState("");
    const [customHobbyInput, setCustomHobbyInput] = useState("");
    const [businessFieldInput, setBusinessFieldInput] = useState("");
    // Linking partner: 'idle' | 'sending' | 'sent' | 'verifying' | 'verified'
    const [linkState, setLinkState] = useState("idle");
    const [linkInfo, setLinkInfo] = useState("");
    const [linkError, setLinkError] = useState("");
    const [partnerOtp, setPartnerOtp] = useState("");
    const [linkBiodata, setLinkBiodata] = useState(null);

    // Jika memilih Ya (Sudah Punya Partner), form 4 biodata langsung disingkirkan.
    const skipBiodata =
        data.role === "member" &&
        data.is_partner === "yes";

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

    const addBusinessField = () => {
        const trimmed = businessFieldInput.trim();
        if (trimmed && !data.business_fields.includes(trimmed)) {
            setData("business_fields", [...data.business_fields, trimmed]);
            setBusinessFieldInput("");
        }
    };

    const removeBusinessField = (fieldToRemove) => {
        setData(
            "business_fields",
            data.business_fields.filter((f) => f !== fieldToRemove),
        );
    };

    const removeIndustry = (categoryToRemove) => {
        setData(
            "industry",
            data.industry.filter((c) => c !== categoryToRemove),
        );
    };

    const filteredHobbies = HOBBY_LIST.filter((h) =>
        h.toLowerCase().includes(hobbySearch.toLowerCase()),
    );

    const readCsrfToken = () => {
        const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
        return match ? decodeURIComponent(match[1]) : "";
    };

    const postJson = async (url, body) => {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "X-XSRF-TOKEN": readCsrfToken(),
            },
            body: JSON.stringify(body),
        });
        const payload = await res.json().catch(() => ({}));
        return { ok: res.ok, payload };
    };

    const requestPartnerOtp = async () => {
        const email = (data.partner_email || "").trim();
        if (!email) {
            setLinkError("Isi email partner Anda terlebih dahulu.");
            return;
        }

        setLinkError("");
        setLinkInfo("");
        setLinkState("sending");

        try {
            const { ok, payload } = await postJson(
                route("register.partner-link.request"),
                {
                    partner_email: email,
                },
            );

            if (!ok) {
                setLinkError(
                    payload?.errors?.partner_email?.[0] ||
                        payload?.message ||
                        "Gagal mengirim OTP.",
                );
                setLinkState("idle");
                return;
            }

            setLinkState("sent");
            setLinkInfo(
                `Kode OTP 6 digit dikirim ke ${payload.email || email}. Mintalah kode tersebut pada partner Anda.`,
            );
        } catch {
            setLinkError("Tidak bisa terhubung ke server. Coba lagi.");
            setLinkState("idle");
        }
    };

    const verifyPartnerOtp = async () => {
        if (!partnerOtp || partnerOtp.length !== 6) {
            setLinkError("Masukkan 6 digit kode OTP.");
            return;
        }

        setLinkError("");
        setLinkState("verifying");

        try {
            const { ok, payload } = await postJson(
                route("register.partner-link.verify"),
                {
                    otp: partnerOtp,
                },
            );

            if (!ok) {
                setLinkError(
                    payload?.errors?.otp?.[0] ||
                        payload?.message ||
                        "Kode OTP salah.",
                );
                setLinkState("sent");
                return;
            }

            setLinkState("verified");
            setLinkBiodata(payload.biodata || null);
            if (!data.email && payload.email) {
                setData("email", payload.email);
            }
            setLinkInfo(
                `Partner terverifikasi: ${payload.partner}. Biodata diambil dari Master Identity partner, form isian tidak perlu diisi ulang.`,
            );
        } catch {
            setLinkError("Tidak bisa terhubung ke server. Coba lagi.");
            setLinkState("sent");
        }
    };

    const submit = (e) => {
        e.preventDefault();
        if (data.role === "member" && data.is_partner !== "yes" && !data.is_household) {
            const validCompanies = (data.companies || []).filter(
                (c) =>
                    c.company?.trim() &&
                    c.industry?.trim() &&
                    c.position?.trim(),
            );
            if (validCompanies.length === 0) {
                alert(
                    'Silakan isi minimal 1 info usaha (Nama Perusahaan, Bidang Industri, Jabatan), atau centang "Bapak / Ibu Rumah Tangga".',
                );
                return;
            }
        }
        if (data.role === "partner") {
            if (!data.industry || data.industry.length === 0) {
                alert("Silakan pilih minimal 1 bidang industri.");
                return;
            }
        }
        if (
            data.role === "member" &&
            data.is_partner === "yes" &&
            linkState !== "verified"
        ) {
            alert(
                'Verifikasi OTP ke email partner terlebih dahulu, atau ubah pilihan menjadi "Bukan Partner".',
            );
            return;
        }
        post(route("register"));
    };

    return (
        <GuestLayout maxWidth="max-w-3xl">
            <Head title="Pendaftaran Akun KBKB" />

            <header className="mb-6 text-center sm:text-left">
                <span className="inline-block rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-deep mb-2">
                    Keanggotaan KBKB
                </span>
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                    Formulir Registrasi
                </h1>
                <p className="mt-1 text-sm text-slate">
                    Silakan isi data lengkap Anda untuk bergabung dalam
                    ekosistem komunitas KBKB.
                </p>
            </header>

            <form onSubmit={submit} className="space-y-8">
                {/* Pilihan Role */}
                <div>
                    <InputLabel
                        value="Tipe Pendaftaran"
                        className="mb-2 text-sm font-semibold"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setData("role", "member")}
                            className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all ${
                                data.role === "member"
                                    ? "border-gold bg-gold/10 text-gold-deep font-bold shadow-sm ring-2 ring-gold/40"
                                    : "border-ink/15 bg-white/70 text-slate hover:bg-ink/5"
                            }`}
                        >
                            <span className="text-2xl mb-1.5">🪪</span>
                            <span className="text-sm font-semibold">
                                Anggota (Member)
                            </span>
                            <span className="text-xs text-slate mt-0.5">
                                Kartu digital, promo & jejaring
                            </span>
                        </button>

                        <Link
                            href={route("partner.register.show")}
                            className="flex flex-col items-center justify-center rounded-2xl border border-ink/15 bg-white/70 p-4 text-center text-slate transition-all hover:bg-gold/10 hover:border-gold hover:text-gold-deep"
                        >
                            <span className="text-2xl mb-1.5">🏪</span>
                            <span className="text-sm font-semibold">
                                Mitra Usaha (Partner)
                            </span>
                            <span className="text-xs text-slate mt-0.5">
                                Promosi brand & merchant KBKB
                            </span>
                        </Link>
                    </div>
                </div>

                {/* ==================================================== */}
                {/* FORM MEMBER                                          */}
                {/* ==================================================== */}
                {data.role === "member" && (
                    <div className="space-y-8">
                        {/* Are you a Partner? — pertanyaan paling awal */}
                        <section className="rounded-2xl border border-ink/10 bg-white/50 p-5 sm:p-6 space-y-4">
                            <div className="border-b border-ink/10 pb-3">
                                <h2 className="font-display text-base font-bold text-ink">
                                    Apakah Anda sudah memiliki akun Partner?
                                </h2>
                                <p className="text-xs text-slate mt-0.5">
                                    Jika ya, isi email partner lalu verifikasi
                                    OTP-nya — 4 form biodata tidak perlu diisi
                                    ulang.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setData("is_partner", "no");
                                        setLinkState("idle");
                                        setLinkInfo("");
                                        setLinkError("");
                                        setPartnerOtp("");
                                        setLinkBiodata(null);
                                    }}
                                    className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                                        data.is_partner !== "yes"
                                            ? "border-gold bg-gold/10 text-gold-deep ring-2 ring-gold/40"
                                            : "border-ink/15 bg-white/70 text-slate hover:bg-ink/5"
                                    }`}
                                >
                                    Belum
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setData("is_partner", "yes")}
                                    className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                                        data.is_partner === "yes"
                                            ? "border-gold bg-gold/10 text-gold-deep ring-2 ring-gold/40"
                                            : "border-ink/15 bg-white/70 text-slate hover:bg-ink/5"
                                    }`}
                                >
                                    Ya (Sudah Punya)
                                </button>
                            </div>

                            {data.is_partner === "yes" && (
                                <div className="space-y-3">
                                    <div>
                                        <InputLabel
                                            htmlFor="partner_email"
                                            value="Email partner *"
                                        />
                                        <TextInput
                                            id="partner_email"
                                            type="email"
                                            value={data.partner_email}
                                            disabled={linkState === "verified"}
                                            onChange={(e) => {
                                                setData(
                                                    "partner_email",
                                                    e.target.value,
                                                );
                                                if (linkState !== "idle") {
                                                    setLinkState("idle");
                                                    setLinkInfo("");
                                                    setLinkError("");
                                                    setPartnerOtp("");
                                                    setLinkBiodata(null);
                                                }
                                            }}
                                            className="mt-1 block w-full"
                                            placeholder="email partner yang terdaftar di KBKB"
                                        />
                                    </div>

                                    {linkState !== "verified" &&
                                        linkState !== "sent" && (
                                            <button
                                                type="button"
                                                onClick={requestPartnerOtp}
                                                disabled={
                                                    linkState === "sending"
                                                }
                                                className="rounded-xl border border-gold/50 bg-gold/15 px-4 py-2 text-sm font-semibold text-gold-deep hover:bg-gold/25 disabled:opacity-50"
                                            >
                                                {linkState === "sending"
                                                    ? "Mengirim OTP…"
                                                    : "Kirim OTP ke Email Partner"}
                                            </button>
                                        )}

                                    {linkState === "sent" && (
                                        <div className="flex flex-wrap items-center gap-2">
                                            <TextInput
                                                inputMode="numeric"
                                                autoComplete="one-time-code"
                                                maxLength={6}
                                                value={partnerOtp}
                                                onChange={(e) =>
                                                    setPartnerOtp(
                                                        e.target.value
                                                            .replace(/\D/g, "")
                                                            .slice(0, 6),
                                                    )
                                                }
                                                className="block w-40 text-center font-mono tracking-[0.35em]"
                                                placeholder="000000"
                                            />
                                            <button
                                                type="button"
                                                onClick={verifyPartnerOtp}
                                                className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90"
                                            >
                                                Verifikasi OTP
                                            </button>
                                            <button
                                                type="button"
                                                onClick={requestPartnerOtp}
                                                disabled={
                                                    linkState === "sending"
                                                }
                                                className="text-sm font-semibold text-gold-deep hover:underline disabled:opacity-50"
                                            >
                                                Kirim ulang
                                            </button>
                                        </div>
                                    )}

                                    {linkState === "verified" && (
                                        <div className="rounded-xl border border-sage/40 bg-sage/15 px-4 py-3 text-sm font-medium text-ink">
                                            {linkInfo ||
                                                "Partner terverifikasi."}
                                        </div>
                                    )}

                                    {linkInfo && linkState !== "verified" && (
                                        <p className="text-xs text-slate">
                                            {linkInfo}
                                        </p>
                                    )}
                                    <InputError
                                        message={
                                            linkError || errors.partner_email
                                        }
                                        className="mt-1"
                                    />
                                </div>
                            )}
                        </section>

                        {/* FORM DATA DIRI */}
                        {skipBiodata ? (
                            <section className="rounded-2xl border border-gold/30 bg-gold/5 p-5 sm:p-6 space-y-4">
                                <div className="border-b border-gold/20 pb-3">
                                    <h2 className="font-display text-base font-bold text-ink flex items-center gap-2">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-deep">
                                            1
                                        </span>
                                        Data Akun (Biodata dari Master Identity)
                                    </h2>
                                    <p className="text-xs text-slate mt-0.5">
                                        Biodata diambil otomatis dari profil
                                        partner Anda — form isian tidak perlu
                                        diisi ulang.
                                    </p>
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="email"
                                        value="Alamat Email Member *"
                                    />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        className="mt-1 block w-full"
                                        placeholder="nama@email.com"
                                        required
                                    />
                                    <InputError
                                        message={errors.email}
                                        className="mt-1"
                                    />
                                    <p className="mt-1 text-xs text-slate">
                                        Kosongkan bila ingin memakai email
                                        partner yang sama.
                                    </p>
                                </div>

                                {linkBiodata && (
                                    <div className="rounded-xl border border-ink/10 bg-white/70 p-4">
                                        <p className="text-xs font-semibold text-gold-deep uppercase tracking-wider mb-2">
                                            Biodata dari Master Identity
                                        </p>
                                        <dl className="grid gap-2 sm:grid-cols-2">
                                            {[
                                                [
                                                    "Nama Lengkap",
                                                    linkBiodata.name,
                                                ],
                                                [
                                                    "No. WhatsApp / Telepon",
                                                    linkBiodata.phone,
                                                ],
                                                [
                                                    "Jenis Kelamin",
                                                    linkBiodata.gender,
                                                ],
                                                [
                                                    "Tanggal Lahir",
                                                    linkBiodata.birth_date,
                                                ],
                                                [
                                                    "Tempat Lahir",
                                                    linkBiodata.birth_place,
                                                ],
                                                [
                                                    "Status Pernikahan",
                                                    linkBiodata.marital_status,
                                                ],
                                                ["Agama", linkBiodata.religion],
                                                ["Kota", linkBiodata.city],
                                                [
                                                    "Kecamatan",
                                                    linkBiodata.district,
                                                ],
                                                ["Alamat", linkBiodata.address],
                                            ]
                                                .filter(([, v]) => v)
                                                .map(([label, value]) => (
                                                    <div
                                                        key={label}
                                                        className="rounded-lg bg-paper p-2.5"
                                                    >
                                                        <dt className="eyebrow">
                                                            {label}
                                                        </dt>
                                                        <dd className="mt-0.5 text-sm font-medium text-ink">
                                                            {value}
                                                        </dd>
                                                    </div>
                                                ))}
                                        </dl>
                                        {Array.isArray(linkBiodata.hobbies) &&
                                            linkBiodata.hobbies.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-1.5">
                                                    {linkBiodata.hobbies.map(
                                                        (h) => (
                                                            <span
                                                                key={h}
                                                                className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-gold-deep"
                                                            >
                                                                {h}
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                )}
                            </section>
                        ) : (
                            <MasterIdentityBiodata
                                data={data}
                                setData={setData}
                                errors={errors}
                            />
                        )}
                    </div>
                )}

                {/* ==================================================== */}
                {/* FORM PARTNER                                         */}
                {/* ==================================================== */}
                {data.role === "partner" && (
                    <div className="space-y-8">
                        {/* 1. DATA PERUSAHAAN & MERK DAGANG */}
                        <section className="rounded-2xl border border-ink/10 bg-white/50 p-5 sm:p-6 space-y-4">
                            <div className="border-b border-ink/10 pb-3">
                                <h2 className="font-display text-base font-bold text-ink flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-deep">
                                        1
                                    </span>
                                    Data Perusahaan & Usaha
                                </h2>
                                <p className="text-xs text-slate mt-0.5">
                                    Informasi profil legalitas & merk dagang
                                    bisnis Anda.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel
                                        htmlFor="name"
                                        value="Nama Perusahaan *"
                                    />
                                    <TextInput
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        className="mt-1 block w-full"
                                        placeholder="Contoh: PT Kabe Sejahtera Mandiri"
                                        required
                                    />
                                    <InputError
                                        message={errors.name}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="trade_name"
                                        value="Nama Merk Dagang *"
                                    />
                                    <TextInput
                                        id="trade_name"
                                        value={data.trade_name}
                                        onChange={(e) =>
                                            setData(
                                                "trade_name",
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1 block w-full"
                                        placeholder="Contoh: Kabe Kabe Coffee & Resto"
                                        required
                                    />
                                    <InputError
                                        message={errors.trade_name}
                                        className="mt-1"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <InputLabel value="Bidang Industri * (Minimal 1, dapat memilih beberapa)" />
                                    <select
                                        id="partner_industry_select"
                                        value=""
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (
                                                val &&
                                                !data.industry.includes(val)
                                            ) {
                                                setData("industry", [
                                                    ...data.industry,
                                                    val,
                                                ]);
                                            }
                                        }}
                                        className="mt-1 block w-full rounded-xl border-ink/20 bg-white/90 px-3 py-2.5 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                                    >
                                        <option value="">
                                            + Pilih & Tambah Bidang Industri...
                                        </option>
                                        {INDUSTRY_CATEGORIES.filter(
                                            (cat) =>
                                                !data.industry.includes(cat),
                                        ).map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                    {data.industry.length > 0 ? (
                                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                                            {data.industry.map((ind) => (
                                                <span
                                                    key={ind}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-gold/15 border border-gold/30 px-3 py-1 text-xs font-semibold text-gold-deep"
                                                >
                                                    {ind}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeIndustry(ind)
                                                        }
                                                        className="text-gold-deep hover:text-ember font-bold"
                                                    >
                                                        ✕
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="mt-1.5 text-xs text-amber-700 font-medium">
                                            ⚠️ Wajib memilih minimal 1 bidang
                                            industri.
                                        </p>
                                    )}
                                    <InputError
                                        message={errors.industry}
                                        className="mt-1"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <InputLabel value="Kategori Partner" />
                                    <div className="mt-1 rounded-xl border border-gold/30 bg-gold/10 px-3.5 py-2.5 text-sm font-semibold text-gold-deep">
                                        {data.industry.length > 0
                                            ? derivePartnerCategory(
                                                  data.industry,
                                              )
                                            : "—"}
                                    </div>
                                    <p className="mt-1 text-xs text-slate">
                                        Kategori diambil otomatis dari bidang
                                        industri yang dipilih.
                                    </p>
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="employee_count"
                                        value="Jumlah Karyawan"
                                    />
                                    <TextInput
                                        id="employee_count"
                                        type="number"
                                        min="0"
                                        value={data.employee_count}
                                        onChange={(e) =>
                                            setData(
                                                "employee_count",
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1 block w-full"
                                        placeholder="Contoh: 15"
                                    />
                                    <InputError
                                        message={errors.employee_count}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="established_since"
                                        value="Berdiri Sejak"
                                    />
                                    <TextInput
                                        id="established_since"
                                        value={data.established_since}
                                        onChange={(e) =>
                                            setData(
                                                "established_since",
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1 block w-full"
                                        placeholder="Contoh: 2018 atau Maret 2020"
                                    />
                                    <InputError
                                        message={errors.established_since}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="phone"
                                        value="Nomor Telepon Usaha / PIC *"
                                    />
                                    <TextInput
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData("phone", e.target.value)
                                        }
                                        className="mt-1 block w-full"
                                        placeholder="081234567890 / 0361-XXXXXX"
                                        required
                                    />
                                    <InputError
                                        message={errors.phone}
                                        className="mt-1"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <InputLabel
                                        htmlFor="email"
                                        value="Email Perusahaan / Login *"
                                    />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        className="mt-1 block w-full"
                                        placeholder="akun@perusahaan.com (digunakan untuk login ke portal partner)"
                                        required
                                    />
                                    <InputError
                                        message={errors.email}
                                        className="mt-1"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <InputLabel
                                        htmlFor="address"
                                        value="Alamat Usaha *"
                                    />
                                    <textarea
                                        id="address"
                                        rows={2}
                                        value={data.address}
                                        onChange={(e) =>
                                            setData("address", e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-xl border-ink/20 bg-white/90 p-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                                        placeholder="Alamat lengkap toko / kantor operasional..."
                                        required
                                    />
                                    <InputError
                                        message={errors.address}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="district"
                                        value="Kecamatan"
                                    />
                                    <TextInput
                                        id="district"
                                        value={data.district}
                                        onChange={(e) =>
                                            setData("district", e.target.value)
                                        }
                                        className="mt-1 block w-full"
                                        placeholder="Contoh: Kuta"
                                    />
                                    <InputError
                                        message={errors.district}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="city"
                                        value="Kota / Kabupaten"
                                    />
                                    <TextInput
                                        id="city"
                                        value={data.city}
                                        onChange={(e) =>
                                            setData("city", e.target.value)
                                        }
                                        className="mt-1 block w-full"
                                        placeholder="Contoh: Badung"
                                    />
                                    <InputError
                                        message={errors.city}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* 2. PERTANYAAN KEANGGOTAAN MEMBER */}
                        <section className="rounded-2xl border border-gold/30 bg-gold/5 p-5 sm:p-6 space-y-4">
                            <div className="border-b border-gold/20 pb-3">
                                <h2 className="font-display text-base font-bold text-ink flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-deep">
                                        2
                                    </span>
                                    Status Keanggotaan Member KBKB
                                </h2>
                                <p className="text-xs text-slate mt-0.5">
                                    Apakah Anda sudah bergabung sebagai Member
                                    KBKB?
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setData("is_member", true)}
                                    className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 text-sm font-semibold transition-all ${
                                        data.is_member
                                            ? "border-gold bg-gold text-ink shadow-sm font-bold"
                                            : "border-ink/15 bg-white text-slate hover:bg-ink/5"
                                    }`}
                                >
                                    <span>✓</span> Ya, Sudah Bergabung
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setData("is_member", false)}
                                    className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 text-sm font-semibold transition-all ${
                                        !data.is_member
                                            ? "border-gold bg-gold text-ink shadow-sm font-bold"
                                            : "border-ink/15 bg-white text-slate hover:bg-ink/5"
                                    }`}
                                >
                                    <span>✗</span> Belum (Daftar Member)
                                </button>
                            </div>

                            {/* JIKA SUDAH BERGABUNG: INPUT NOMOR ID, NAMA, TGL LAHIR */}
                            {data.is_member ? (
                                <div className="mt-4 rounded-xl border border-ink/10 bg-white/70 p-4 space-y-4">
                                    <p className="text-xs font-semibold text-gold-deep uppercase tracking-wider">
                                        Data Verifikasi Member Terdaftar:
                                    </p>
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div>
                                            <InputLabel
                                                htmlFor="member_id_number"
                                                value="Nomor ID Member *"
                                            />
                                            <TextInput
                                                id="member_id_number"
                                                value={data.member_id_number}
                                                onChange={(e) =>
                                                    setData(
                                                        "member_id_number",
                                                        e.target.value,
                                                    )
                                                }
                                                className="mt-1 block w-full font-mono"
                                                placeholder="KBKB-XXXXXX"
                                                required={data.is_member}
                                            />
                                            <InputError
                                                message={
                                                    errors.member_id_number
                                                }
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel
                                                htmlFor="member_name"
                                                value="Nama Lengkap Member *"
                                            />
                                            <TextInput
                                                id="member_name"
                                                value={data.member_name}
                                                onChange={(e) =>
                                                    setData(
                                                        "member_name",
                                                        e.target.value,
                                                    )
                                                }
                                                className="mt-1 block w-full"
                                                placeholder="Sesuai kartu member"
                                                required={data.is_member}
                                            />
                                            <InputError
                                                message={errors.member_name}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel
                                                htmlFor="member_birth_date"
                                                value="Tanggal Lahir Member *"
                                            />
                                            <TextInput
                                                id="member_birth_date"
                                                type="date"
                                                value={data.member_birth_date}
                                                onChange={(e) =>
                                                    setData(
                                                        "member_birth_date",
                                                        e.target.value,
                                                    )
                                                }
                                                className="mt-1 block w-full"
                                                required={data.is_member}
                                            />
                                            <InputError
                                                message={
                                                    errors.member_birth_date
                                                }
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* JIKA BELUM: FORM LENGKAP PENDAFTARAN BIODATA MEMBER */
                                <div className="mt-4 rounded-xl border border-ink/10 bg-white/70 p-4 sm:p-5 space-y-5">
                                    <div className="border-b border-ink/10 pb-2.5">
                                        <p className="text-xs font-bold uppercase tracking-wider text-gold-deep">
                                            Formulir Lengkap Biodata Member KBKB
                                        </p>
                                        <p className="text-xs text-slate mt-0.5">
                                            Isi data lengkap Anda untuk
                                            dibuatkan profil keanggotaan Member
                                            sekaligus.
                                        </p>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <InputLabel
                                                htmlFor="pic_name"
                                                value="Nama Lengkap *"
                                            />
                                            <TextInput
                                                id="pic_name"
                                                value={data.pic_name}
                                                onChange={(e) =>
                                                    setData(
                                                        "pic_name",
                                                        e.target.value,
                                                    )
                                                }
                                                className="mt-1 block w-full"
                                                placeholder="Nama lengkap sesuai KTP"
                                                required={!data.is_member}
                                            />
                                            <InputError
                                                message={errors.pic_name}
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
                                                placeholder="Panggilan akrab"
                                            />
                                            <InputError
                                                message={errors.nickname}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel
                                                htmlFor="gender"
                                                value="Jenis Kelamin *"
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
                                                required={!data.is_member}
                                            >
                                                <option value="">
                                                    Pilih Jenis Kelamin...
                                                </option>
                                                <option value="Laki-laki">
                                                    Laki-laki
                                                </option>
                                                <option value="Perempuan">
                                                    Perempuan
                                                </option>
                                            </select>
                                            <InputError
                                                message={errors.gender}
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
                                                    Pilih Status Pernikahan...
                                                </option>
                                                <option value="Belum Menikah">
                                                    Belum Menikah
                                                </option>
                                                <option value="Menikah">
                                                    Menikah
                                                </option>
                                                <option value="Cerai Hidup">
                                                    Cerai Hidup
                                                </option>
                                                <option value="Cerai Mati">
                                                    Cerai Mati
                                                </option>
                                            </select>
                                            <InputError
                                                message={errors.marital_status}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel
                                                htmlFor="birth_place"
                                                value="Tempat Lahir"
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
                                                placeholder="Kota Kelahiran"
                                            />
                                            <InputError
                                                message={errors.birth_place}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel
                                                htmlFor="birth_date"
                                                value="Tanggal Lahir *"
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
                                                required={!data.is_member}
                                            />
                                            <InputError
                                                message={errors.birth_date}
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
                                                <option value="Kristen Protestan">
                                                    Kristen Protestan
                                                </option>
                                                <option value="Katolik">
                                                    Katolik
                                                </option>
                                                <option value="Islam">
                                                    Islam
                                                </option>
                                                <option value="Hindu">
                                                    Hindu
                                                </option>
                                                <option value="Buddha">
                                                    Buddha
                                                </option>
                                                <option value="Konghucu">
                                                    Konghucu
                                                </option>
                                            </select>
                                            <InputError
                                                message={errors.religion}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel
                                                htmlFor="place_of_worship_address"
                                                value="Alamat Tempat Ibadah"
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
                                                placeholder="Nama/lokasi gereja/tempat ibadah"
                                            />
                                            <InputError
                                                message={
                                                    errors.place_of_worship_address
                                                }
                                                className="mt-1"
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <InputLabel
                                                htmlFor="member_address"
                                                value="Alamat Rumah Tinggal"
                                            />
                                            <textarea
                                                id="member_address"
                                                rows={2}
                                                value={data.member_address}
                                                onChange={(e) =>
                                                    setData(
                                                        "member_address",
                                                        e.target.value,
                                                    )
                                                }
                                                className="mt-1 block w-full rounded-xl border-ink/20 bg-white/90 p-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                                                placeholder="Alamat domisili tempat tinggal..."
                                            />
                                            <InputError
                                                message={errors.member_address}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel
                                                htmlFor="member_district"
                                                value="Kecamatan Domisili"
                                            />
                                            <TextInput
                                                id="member_district"
                                                value={data.member_district}
                                                onChange={(e) =>
                                                    setData(
                                                        "member_district",
                                                        e.target.value,
                                                    )
                                                }
                                                className="mt-1 block w-full"
                                                placeholder="Kecamatan tempat tinggal"
                                            />
                                            <InputError
                                                message={errors.member_district}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel
                                                htmlFor="member_city"
                                                value="Kota / Kabupaten Domisili"
                                            />
                                            <TextInput
                                                id="member_city"
                                                value={data.member_city}
                                                onChange={(e) =>
                                                    setData(
                                                        "member_city",
                                                        e.target.value,
                                                    )
                                                }
                                                className="mt-1 block w-full"
                                                placeholder="Kota domisili"
                                            />
                                            <InputError
                                                message={errors.member_city}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    {/* HOBI SELECTOR (58 HOBBY_LIST) */}
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center justify-between">
                                            <InputLabel value="Pilihan Minat & Hobi (Pilih yang sesuai)" />
                                            <span className="text-xs text-slate">
                                                {data.hobbies.length} dipilih
                                            </span>
                                        </div>

                                        <input
                                            type="text"
                                            value={hobbySearch}
                                            onChange={(e) =>
                                                setHobbySearch(e.target.value)
                                            }
                                            placeholder="Cari hobi..."
                                            className="block w-full rounded-xl border-ink/20 bg-white/90 px-3 py-2 text-xs text-ink placeholder-slate/50 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                                        />

                                        <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-ink/10 bg-white/80 p-3">
                                            {filteredHobbies.map((hobby) => {
                                                const selected =
                                                    data.hobbies.includes(
                                                        hobby,
                                                    );
                                                return (
                                                    <button
                                                        key={hobby}
                                                        type="button"
                                                        onClick={() =>
                                                            toggleHobby(hobby)
                                                        }
                                                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                                                            selected
                                                                ? "bg-gold text-ink shadow-sm font-semibold"
                                                                : "bg-ink/5 text-slate hover:bg-ink/10 hover:text-ink"
                                                        }`}
                                                    >
                                                        {selected
                                                            ? `✓ ${hobby}`
                                                            : hobby}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <div className="flex gap-2">
                                            <input
                                                type="text"
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
                                                placeholder="Hobi lainnya (isi sendiri)..."
                                                className="block flex-1 rounded-xl border-ink/20 bg-white/90 px-3 py-2 text-xs text-ink placeholder-slate/50 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                                            />
                                            <button
                                                type="button"
                                                onClick={addCustomHobby}
                                                className="rounded-xl border border-gold/40 bg-gold/15 px-3 py-2 text-xs font-semibold text-gold-deep hover:bg-gold/25"
                                            >
                                                + Tambah
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {/* Notifikasi Sistem & Submit */}
                <div className="rounded-2xl border border-gold/30 bg-gold/5 p-4 text-xs text-slate space-y-1">
                    <p className="font-semibold text-gold-deep flex items-center gap-1.5">
                        <span>ℹ️</span> Informasi Keamanan Akun:
                    </p>
                    <p>
                        Pendaftaran Anda akan ditinjau dan diverifikasi oleh
                        admin pengurus KBKB terlebih dahulu.
                    </p>
                    <p>
                        Setelah disetujui, Anda akan menerima email berisi
                        konfirmasi persetujuan beserta password awal untuk login
                        pertama kali.
                    </p>
                </div>

                <PrimaryButton
                    className="w-full justify-center py-3 text-base font-semibold"
                    disabled={processing}
                >
                    {processing
                        ? "Memproses Pendaftaran…"
                        : "Kirim Pendaftaran"}
                </PrimaryButton>
            </form>

            <p className="mt-6 text-center text-sm text-slate">
                Sudah memiliki akun?{" "}
                <Link
                    href={route("login")}
                    className="font-semibold text-gold-deep hover:underline"
                >
                    Masuk di sini
                </Link>
            </p>
        </GuestLayout>
    );
}
