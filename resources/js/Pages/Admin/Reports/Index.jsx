import { Head, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatDate, formatRupiah } from '@/Utils/format';

const TABS = [
    { key: 'transaction', label: 'Laporan Transaksi' },
    { key: 'member_stats', label: 'Statistik Member' },
    { key: 'birthday', label: 'Laporan Ulang Tahun' },
];

const MONTH_OPTIONS = [
    { value: '', label: 'Semua bulan' },
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
];

function StatBox({ label, value, tone = 'ink' }) {
    return (
        <div className="rounded-2xl border border-ink/10 bg-white/60 p-4">
            <p className="eyebrow">{label}</p>
            <p className={`mt-1 font-display text-2xl font-bold ${tone === 'gold' ? 'text-gold-deep' : tone === 'ember' ? 'text-ember' : tone === 'sage' ? 'text-sage' : 'text-ink'}`}>
                {value}
            </p>
        </div>
    );
}

function TabButton({ active, onClick, label }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                active ? 'text-ink' : 'text-slate hover:text-ink'
            }`}
        >
            {label}
            {active && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-gold" />}
        </button>
    );
}

function SectionTitle({ children }) {
    return <h2 className="font-display text-lg font-bold">{children}</h2>;
}

function EmptyRow({ colSpan, message }) {
    return (
        <tr>
            <td colSpan={colSpan} className="px-2 py-4 text-center text-sm text-slate">
                {message}
            </td>
        </tr>
    );
}

function TransactionDetails({ transactions }) {
    return (
        <section className="card-surface overflow-x-auto p-6">
            <SectionTitle>Rincian Transaksi</SectionTitle>
            <table className="mt-4 w-full text-left text-sm">
                <thead className="border-b border-ink/10">
                    <tr>
                        <th className="table-head px-2 py-2">Tanggal</th>
                        <th className="table-head px-2 py-2">No. Transaksi</th>
                        <th className="table-head px-2 py-2">Member</th>
                        <th className="table-head px-2 py-2">Partner</th>
                        <th className="table-head px-2 py-2 text-right">Total</th>
                        <th className="table-head px-2 py-2 text-right">Diskon</th>
                        <th className="table-head px-2 py-2 text-right">Bersih</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                    {transactions.length === 0 ? (
                        <EmptyRow colSpan={7} message="Tidak ada transaksi untuk periode ini." />
                    ) : (
                        transactions.map((t) => (
                            <tr key={t.id}>
                                <td className="px-2 py-2 text-slate">{formatDate(t.transacted_at)}</td>
                                <td className="px-2 py-2 font-mono text-xs">{t.transaction_number}</td>
                                <td className="px-2 py-2">{t.member?.name}</td>
                                <td className="px-2 py-2">{t.partner?.name}</td>
                                <td className="px-2 py-2 text-right">{formatRupiah(t.total_amount)}</td>
                                <td className="px-2 py-2 text-right text-sage">-{formatRupiah(t.discount_amount)}</td>
                                <td className="px-2 py-2 text-right font-bold">{formatRupiah(t.net_amount)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </section>
    );
}

function VendorReport({ data, partnerFilter }) {
    const filtered = useMemo(() => {
        if (!partnerFilter) return data;
        return data.map((month) => ({
            ...month,
            rows: month.rows.filter((row) => row.partner === partnerFilter),
        })).filter((month) => month.rows.length > 0);
    }, [data, partnerFilter]);

    if (filtered.length === 0) {
        return <p className="text-sm text-slate">Tidak ada data transaksi vendor untuk filter ini.</p>;
    }

    return (
        <div className="space-y-6">
            {filtered.map((month) => (
                <div key={month.month} className="card-surface overflow-x-auto p-6">
                    <p className="eyebrow mb-3">{month.label}</p>
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-ink/10">
                            <tr>
                                <th className="table-head px-2 py-2">Vendor</th>
                                <th className="table-head px-2 py-2 text-right">Transaksi</th>
                                <th className="table-head px-2 py-2 text-right">Diskon Bersih</th>
                                <th className="table-head px-2 py-2 text-right">Penjualan Bersih</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/5">
                            {month.rows.length === 0 ? (
                                <EmptyRow colSpan={4} message="Tidak ada data untuk bulan ini." />
                            ) : (
                                month.rows.map((row, i) => (
                                    <tr key={i}>
                                        <td className="px-2 py-2 font-semibold">{row.partner}</td>
                                        <td className="px-2 py-2 text-right">{row.total_transactions}</td>
                                        <td className="px-2 py-2 text-right text-ember">-{formatRupiah(row.net_discount)}</td>
                                        <td className="px-2 py-2 text-right font-bold">{formatRupiah(row.net_sales)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
}

function MemberReport({ data, memberFilter }) {
    const filtered = useMemo(() => {
        if (!memberFilter) return data;
        return data.map((month) => ({
            ...month,
            rows: month.rows.filter((row) => row.member === memberFilter),
        })).filter((month) => month.rows.length > 0);
    }, [data, memberFilter]);

    if (filtered.length === 0) {
        return <p className="text-sm text-slate">Tidak ada data transaksi member untuk filter ini.</p>;
    }

    return (
        <div className="space-y-6">
            {filtered.map((month) => (
                <div key={month.month} className="card-surface overflow-x-auto p-6">
                    <p className="eyebrow mb-3">{month.label}</p>
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-ink/10">
                            <tr>
                                <th className="table-head px-2 py-2">Member</th>
                                <th className="table-head px-2 py-2">Kode Member</th>
                                <th className="table-head px-2 py-2 text-right">Transaksi</th>
                                <th className="table-head px-2 py-2 text-right">Total Diskon</th>
                                <th className="table-head px-2 py-2 text-right">Penjualan Bersih</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/5">
                            {month.rows.length === 0 ? (
                                <EmptyRow colSpan={5} message="Tidak ada data untuk bulan ini." />
                            ) : (
                                month.rows.map((row, i) => (
                                    <tr key={i}>
                                        <td className="px-2 py-2 font-semibold">{row.member}</td>
                                        <td className="px-2 py-2 font-mono text-xs">{row.member_code}</td>
                                        <td className="px-2 py-2 text-right">{row.total_transactions}</td>
                                        <td className="px-2 py-2 text-right text-ember">-{formatRupiah(row.total_discount)}</td>
                                        <td className="px-2 py-2 text-right font-bold">{formatRupiah(row.net_sales)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
}

function MemberStatisticsTable({ data, genderFilter, religionFilter }) {
    const { months, month_labels, rows } = data;

    const visibleRows = useMemo(() => {
        return rows.filter((row) => {
            if (row.key.startsWith('religion_') && religionFilter && row.key !== `religion_${religionFilter}`) return false;
            if ((row.key === 'male' || row.key === 'female') && genderFilter && row.key !== genderFilter) return false;
            return true;
        });
    }, [rows, genderFilter, religionFilter]);

    if (!months || months.length === 0) {
        return <p className="text-sm text-slate">Tidak ada data statistik tersedia.</p>;
    }

    return (
        <div className="card-surface overflow-x-auto p-6">
            <SectionTitle>Laporan Statistik Member</SectionTitle>
            <table className="mt-4 w-full min-w-[48rem] text-left text-sm">
                <thead className="border-b border-ink/10">
                    <tr>
                        <th className="table-head sticky left-0 bg-paper px-3 py-2">Metrik</th>
                        {month_labels.map((label, i) => (
                            <th key={months[i]} className="table-head px-3 py-2 text-right">
                                {label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                    {visibleRows.length === 0 ? (
                        <tr>
                            <td colSpan={months.length + 1} className="px-3 py-4 text-center text-sm text-slate">Tidak ada baris yang sesuai dengan filter yang dipilih.</td>
                        </tr>
                    ) : (
                        visibleRows.map((row) => (
                            <tr key={row.key}>
                                <td className="sticky left-0 bg-paper px-3 py-2 font-semibold">{row.label}</td>
                                {row.values.map((value, i) => (
                                    <td key={months[i]} className="px-3 py-2 text-right">
                                        {value}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

function BirthdayReport({ birthdays, monthFilter, dateFrom, dateTo }) {
    const filtered = useMemo(() => {
        let list = birthdays;
        if (monthFilter) {
            list = list.filter((group) => String(group.month) === monthFilter);
        }
        if (!dateFrom && !dateTo) {
            return list;
        }

        return list.map((group) => {
            const members = group.members.filter((m) => {
                if (!m.birth_date) return false;
                if (dateFrom && m.birth_date < dateFrom) return false;
                if (dateTo && m.birth_date > dateTo) return false;
                return true;
            });
            return { ...group, members };
        }).filter((group) => group.members.length > 0);
    }, [birthdays, monthFilter, dateFrom, dateTo]);

    if (filtered.length === 0) {
        return <p className="text-sm text-slate">Tidak ada data ulang tahun untuk filter ini.</p>;
    }

    return (
        <div className="space-y-6">
            {filtered.map((group) => (
                <div key={group.month} className="card-surface overflow-x-auto p-6">
                    <p className="eyebrow mb-3">{group.month_label}</p>
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-ink/10">
                            <tr>
                                <th className="table-head px-2 py-2">Tanggal</th>
                                <th className="table-head px-2 py-2">Member</th>
                                <th className="table-head px-2 py-2">Kode Member</th>
                                <th className="table-head px-2 py-2 text-right">Usia</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/5">
                            {group.members.map((member) => (
                                <tr key={member.id}>
                                    <td className="px-2 py-2 font-mono text-xs">{formatDate(member.birth_date)}</td>
                                    <td className="px-2 py-2 font-semibold">{member.name}</td>
                                    <td className="px-2 py-2 font-mono text-xs">{member.member_code}</td>
                                    <td className="px-2 py-2 text-right">{member.age}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
}

export default function ReportIndex({ summary, by_partner, by_member, transactions, member_stats, birthdays, filters }) {
    const filter = useForm(filters);
    const [activeTab, setActiveTab] = useState('transaction');
    const [transactionPartner, setTransactionPartner] = useState('');
    const [transactionMember, setTransactionMember] = useState('');
    const [statsGender, setStatsGender] = useState('');
    const [statsReligion, setStatsReligion] = useState('');
    const [birthdayMonth, setBirthdayMonth] = useState(filters.birthday_month || '');
    const [birthdayFrom, setBirthdayFrom] = useState(filters.birthday_from || '');
    const [birthdayTo, setBirthdayTo] = useState(filters.birthday_to || '');

    const applyFilter = (e) => {
        e.preventDefault();
        filter.get(route('admin.reports.index'), { preserveState: true, replace: true });
    };

    const partners = useMemo(() => {
        const set = new Set();
        by_partner.forEach((m) => m.rows.forEach((r) => set.add(r.partner)));
        return Array.from(set).sort();
    }, [by_partner]);

    const members = useMemo(() => {
        const set = new Set();
        by_member.forEach((m) => m.rows.forEach((r) => set.add(r.member)));
        return Array.from(set).sort();
    }, [by_member]);

    return (
        <>
            <Head title="Laporan" />

            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="eyebrow">Pelaporan</p>
                        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Laporan & Statistik</h1>
                    </div>

                    <div className="flex flex-wrap items-end gap-2">
                        <form onSubmit={applyFilter} className="flex flex-wrap items-end gap-2">
                            <div>
                                <label className="label">Dari</label>
                                <input type="date" className="input" value={filter.data.from} onChange={(e) => filter.setData('from', e.target.value)} />
                            </div>
                            <div>
                                <label className="label">Sampai</label>
                                <input type="date" className="input" value={filter.data.to} onChange={(e) => filter.setData('to', e.target.value)} />
                            </div>
                            <button type="submit" className="btn-ink text-xs">Terapkan</button>
                        </form>
                        <a
                            href={route('admin.reports.export', {
                                type: activeTab,
                                from: filter.data.from,
                                to: filter.data.to,
                                birthday_from: birthdayFrom,
                                birthday_to: birthdayTo,
                                birthday_month: birthdayMonth,
                            })}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition"
                            title="Export data tab aktif ke Excel"
                        >
                            <span>📊</span>
                            <span>Export Excel</span>
                        </a>
                    </div>
                </header>

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatBox label="Total Transaksi" value={summary.total_transactions} />
                    <StatBox label="Total Belanja" value={formatRupiah(summary.total_amount)} />
                    <StatBox label="Total Diskon" value={formatRupiah(summary.discount_amount)} tone="ember" />
                    <StatBox label="Penjualan Bersih" value={formatRupiah(summary.net_amount)} tone="gold" />
                </section>

                <div className="border-b border-ink/10">
                    <div className="flex gap-2">
                        {TABS.map((tab) => (
                            <TabButton
                                key={tab.key}
                                active={activeTab === tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                label={tab.label}
                            />
                        ))}
                    </div>
                </div>

                {activeTab === 'transaction' && (
                    <div className="flex flex-col gap-8">
                        <div className="card-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
                            <div className="grid flex-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="label">Filter Vendor</label>
                                    <select className="input" value={transactionPartner} onChange={(e) => setTransactionPartner(e.target.value)}>
                                        <option value="">Semua vendor</option>
                                        {partners.map((name) => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Filter Member</label>
                                    <select className="input" value={transactionMember} onChange={(e) => setTransactionMember(e.target.value)}>
                                        <option value="">Semua member</option>
                                        {members.map((name) => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button type="button" onClick={() => { setTransactionPartner(''); setTransactionMember(''); }} className="btn-ghost text-xs">Atur Ulang</button>
                        </div>

                        <section className="card-surface p-6">
                            <SectionTitle>Laporan Transaksi Per Vendor</SectionTitle>
                            <div className="mt-4">
                                <VendorReport data={by_partner} partnerFilter={transactionPartner} />
                            </div>
                        </section>

                        <section className="card-surface p-6">
                            <SectionTitle>Laporan Transaksi Per Member</SectionTitle>
                            <div className="mt-4">
                                <MemberReport data={by_member} memberFilter={transactionMember} />
                            </div>
                        </section>

                        <TransactionDetails transactions={transactions} />
                    </div>
                )}

                {activeTab === 'member_stats' && (
                    <div className="flex flex-col gap-4">
                        <div className="card-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
                            <div className="grid flex-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="label">Filter Jenis Kelamin</label>
                                    <select className="input" value={statsGender} onChange={(e) => setStatsGender(e.target.value)}>
                                        <option value="">Semua jenis kelamin</option>
                                        <option value="male">Pria</option>
                                        <option value="female">Wanita</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Filter Agama</label>
                                    <select className="input" value={statsReligion} onChange={(e) => setStatsReligion(e.target.value)}>
                                        <option value="">Semua agama</option>
                                        <option value="katolik">Katolik</option>
                                        <option value="kristen">Kristen</option>
                                        <option value="buddha">Buddha</option>
                                        <option value="hindu">Hindu</option>
                                        <option value="islam">Islam</option>
                                        <option value="lainnya">Lainnya</option>
                                    </select>
                                </div>
                            </div>
                            <button type="button" onClick={() => { setStatsGender(''); setStatsReligion(''); }} className="btn-ghost text-xs">Atur Ulang</button>
                        </div>
                        <MemberStatisticsTable data={member_stats} genderFilter={statsGender} religionFilter={statsReligion} />
                    </div>
                )}

                {activeTab === 'birthday' && (
                    <section className="card-surface p-6">
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div className="flex flex-wrap items-end gap-3">
                                <div className="w-full sm:w-48">
                                    <label className="label">Filter Bulan</label>
                                    <select className="input" value={birthdayMonth} onChange={(e) => setBirthdayMonth(e.target.value)}>
                                        {MONTH_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-full sm:w-44">
                                    <label className="label">Dari Tanggal Lahir</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={birthdayFrom}
                                        onChange={(e) => setBirthdayFrom(e.target.value)}
                                    />
                                </div>
                                <div className="w-full sm:w-44">
                                    <label className="label">Sampai Tanggal Lahir</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={birthdayTo}
                                        onChange={(e) => setBirthdayTo(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setBirthdayMonth('');
                                        setBirthdayFrom('');
                                        setBirthdayTo('');
                                    }}
                                    className="btn-ghost text-xs"
                                >
                                    Atur Ulang
                                </button>
                            </div>
                            <a
                                href={route('admin.reports.export', {
                                    type: 'birthday',
                                    birthday_month: birthdayMonth,
                                    birthday_from: birthdayFrom,
                                    birthday_to: birthdayTo,
                                })}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition self-start sm:self-end"
                            >
                                <span>📊</span>
                                <span>Export Excel (.xlsx)</span>
                            </a>
                        </div>
                        <SectionTitle>Laporan Ulang Tahun (HUT)</SectionTitle>
                        <div className="mt-4">
                            <BirthdayReport birthdays={birthdays} monthFilter={birthdayMonth} dateFrom={birthdayFrom} dateTo={birthdayTo} />
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}

ReportIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
