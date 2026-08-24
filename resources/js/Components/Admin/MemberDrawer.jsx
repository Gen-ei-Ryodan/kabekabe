import { router, useForm } from '@inertiajs/react';
import SlideOver from '@/Components/SlideOver';
import StatusChip from '@/Components/StatusChip';
import { formatDate, formatRupiah } from '@/Utils/format';

function CreateMemberDrawer({ onClose }) {
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        whatsapp: '',
        company: '',
        valid_until: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('admin.members.store'), { preserveScroll: true });
    };

    return (
        <form id="member-form" onSubmit={submit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <label className="label" htmlFor="name">Full name</label>
                    <input id="name" type="text" className="input" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                    {form.errors.name && <p className="mt-1 text-xs text-ember">{form.errors.name}</p>}
                </div>
                <div>
                    <label className="label" htmlFor="email">Email</label>
                    <input id="email" type="email" className="input" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                    {form.errors.email && <p className="mt-1 text-xs text-ember">{form.errors.email}</p>}
                </div>
                <div>
                    <label className="label" htmlFor="valid_until">Valid until</label>
                    <input id="valid_until" type="date" className="input" value={form.data.valid_until} onChange={(e) => form.setData('valid_until', e.target.value)} />
                    {form.errors.valid_until && <p className="mt-1 text-xs text-ember">{form.errors.valid_until}</p>}
                </div>
                <div>
                    <label className="label" htmlFor="password">Password</label>
                    <input id="password" type="password" className="input" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} />
                    {form.errors.password && <p className="mt-1 text-xs text-ember">{form.errors.password}</p>}
                </div>
                <div>
                    <label className="label" htmlFor="password_confirmation">Confirm password</label>
                    <input id="password_confirmation" type="password" className="input" value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} />
                </div>
                <div>
                    <label className="label" htmlFor="phone">Phone</label>
                    <input id="phone" type="text" className="input" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} />
                </div>
                <div>
                    <label className="label" htmlFor="whatsapp">WhatsApp</label>
                    <input id="whatsapp" type="text" className="input" value={form.data.whatsapp} onChange={(e) => form.setData('whatsapp', e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                    <label className="label" htmlFor="company">Company</label>
                    <input id="company" type="text" className="input" value={form.data.company} onChange={(e) => form.setData('company', e.target.value)} />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-gold" disabled={form.processing}>
                    {form.processing ? 'Saving…' : 'Add Member'}
                </button>
            </div>
        </form>
    );
}

function EditMemberDrawer({ member, onClose }) {
    const form = useForm({
        name: member.name,
        email: member.email,
        phone: member.phone || '',
        whatsapp: member.whatsapp || '',
        company: member.company || '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(route('admin.members.update', member.id), { preserveScroll: true });
    };

    return (
        <form id="member-form" onSubmit={submit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <label className="label" htmlFor="name">Full name</label>
                    <input id="name" type="text" className="input" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                    {form.errors.name && <p className="mt-1 text-xs text-ember">{form.errors.name}</p>}
                </div>
                <div>
                    <label className="label" htmlFor="email">Email</label>
                    <input id="email" type="email" className="input" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                    {form.errors.email && <p className="mt-1 text-xs text-ember">{form.errors.email}</p>}
                </div>
                <div>
                    <label className="label" htmlFor="phone">Phone</label>
                    <input id="phone" type="text" className="input" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} />
                </div>
                <div>
                    <label className="label" htmlFor="whatsapp">WhatsApp</label>
                    <input id="whatsapp" type="text" className="input" value={form.data.whatsapp} onChange={(e) => form.setData('whatsapp', e.target.value)} />
                </div>
                <div>
                    <label className="label" htmlFor="company">Company</label>
                    <input id="company" type="text" className="input" value={form.data.company} onChange={(e) => form.setData('company', e.target.value)} />
                </div>
                <div>
                    <label className="label" htmlFor="password">New password (optional)</label>
                    <input id="password" type="password" className="input" placeholder="Leave blank to keep current password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} />
                    {form.errors.password && <p className="mt-1 text-xs text-ember">{form.errors.password}</p>}
                </div>
                <div>
                    <label className="label" htmlFor="password_confirmation">Confirm password</label>
                    <input id="password_confirmation" type="password" className="input" value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-gold" disabled={form.processing}>
                    {form.processing ? 'Saving…' : 'Save'}
                </button>
            </div>
        </form>
    );
}

function ShowMemberDrawer({ drawer, onClose, onEdit }) {
    const { member, membership, payments, transactions } = drawer;

    const remove = () => {
        if (confirm('Delete this member?')) router.delete(route('admin.members.destroy', member.id));
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {member.avatar_url ? (
                        <img src={member.avatar_url} alt={member.name} className="h-12 w-12 rounded-2xl object-cover" />
                    ) : (
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink font-display text-xl font-bold text-gold-light">{member.name.charAt(0)}</span>
                    )}
                    <div>
                        <p className="font-mono text-xs text-slate">{member.member_code}</p>
                        <p className="text-sm font-semibold">{member.email}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={onEdit} className="btn-ghost text-xs">Edit</button>
                    <button onClick={remove} className="btn-danger text-xs">Delete</button>
                </div>
            </div>

            <section className="rounded-2xl border border-ink/10 p-5">
                <h2 className="font-display text-lg font-bold">Membership</h2>
                {membership ? (
                    <div className="mt-3 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="eyebrow">Status</span>
                            <StatusChip status={membership.status} label={membership.status === 'active' ? 'Active' : 'Inactive'} pulse={membership.status === 'active'} />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate">Plan</span>
                            <span className="font-semibold">{membership.plan?.name || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate">Start</span>
                            <span className="font-mono text-xs">{formatDate(membership.starts_at)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate">Valid until</span>
                            <span className="font-mono text-xs">{formatDate(membership.expires_at)}</span>
                        </div>
                    </div>
                ) : (
                    <p className="mt-3 text-sm text-slate">No membership yet.</p>
                )}
            </section>

            <section className="rounded-2xl border border-ink/10 p-5">
                <h2 className="font-display text-lg font-bold">Contact Information</h2>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                    {[
                        ['Phone', member.phone || '-'],
                        ['WhatsApp', member.whatsapp || '-'],
                        ['Company', member.company || '-'],
                        ['Joined', member.created_at],
                    ].map(([label, value]) => (
                        <div key={label} className="rounded-xl bg-paper p-3">
                            <dt className="eyebrow">{label}</dt>
                            <dd className="mt-1 text-sm font-medium">{value}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            <section className="rounded-2xl border border-ink/10 p-5">
                <h2 className="font-display text-lg font-bold">Recent Transactions</h2>
                <div className="mt-3 space-y-3">
                    {transactions.length === 0 ? (
                        <p className="text-sm text-slate">No transactions yet.</p>
                    ) : (
                        transactions.map((t) => (
                            <a
                                key={t.id}
                                href={route('admin.transactions.index', { drawer: 'show', id: t.id })}
                                className="flex items-center justify-between rounded-xl border border-ink/10 p-4 transition-colors hover:bg-paper/60"
                            >
                                <div>
                                    <p className="font-mono text-xs text-slate">{t.transaction_number}</p>
                                    <p className="text-sm font-semibold">{t.partner?.name}</p>
                                </div>
                                <p className="font-bold">{formatRupiah(t.net_amount)}</p>
                            </a>
                        ))
                    )}
                </div>
            </section>

            <section className="rounded-2xl border border-ink/10 p-5">
                <h2 className="font-display text-lg font-bold">Payment History</h2>
                <div className="mt-3 space-y-3">
                    {payments.length === 0 ? (
                        <p className="text-sm text-slate">No payments yet.</p>
                    ) : (
                        payments.map((p) => (
                            <a
                                key={p.id}
                                href={route('admin.payments.index', { drawer: 'show', id: p.id })}
                                className="flex items-center justify-between rounded-xl border border-ink/10 p-4 transition-colors hover:bg-paper/60"
                            >
                                <div>
                                    <p className="text-sm font-semibold">{formatRupiah(p.amount)}</p>
                                    <p className="font-mono text-xs text-slate">{formatDate(p.created_at)}</p>
                                </div>
                                <StatusChip status={p.status} label={p.status} />
                            </a>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}

export default function MemberDrawer({ drawer, onClose, onEdit }) {
    if (!drawer?.mode) return null;

    const meta = {
        create: ['Add Member', 'Create a new member along with their membership.'],
        edit: ['Edit Member', drawer.member?.member_code],
        show: [drawer.member?.name, drawer.member?.email],
    };

    const [title, subtitle] = meta[drawer.mode] || ['', ''];

    return (
        <SlideOver open onClose={onClose} title={title} subtitle={subtitle} width="max-w-2xl">
            {drawer.mode === 'create' && <CreateMemberDrawer onClose={onClose} />}
            {drawer.mode === 'edit' && <EditMemberDrawer key={drawer.member?.id} member={drawer.member} onClose={onClose} />}
            {drawer.mode === 'show' && <ShowMemberDrawer key={drawer.member?.id} drawer={drawer} onClose={onClose} onEdit={onEdit} />}
        </SlideOver>
    );
}