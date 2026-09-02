import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

const TYPE_LABELS = {
    event: 'Event',
    agenda: 'Agenda',
};

export default function CommunityEdit({ info }) {
    const form = useForm({
        type: info.type,
        title: info.title,
        content: info.content,
        event_date: info.event_date || '',
        location: info.location || '',
        fee: info.fee || '',
        image: null,
        is_published: Boolean(info.is_published),
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(route('admin.community.update', info.id), { preserveScroll: true });
    };

    return (
        <>
            <Head title="Edit Agenda" />

            <div className="mx-auto max-w-2xl">
                <header>
                    <p className="eyebrow">Agenda Kegiatan</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Edit Event Agenda</h1>
                </header>

                <form onSubmit={submit} className="card-surface mt-8 space-y-6 p-6 sm:p-8">
                    <div>
                        <label className="label" htmlFor="type">Type</label>
                        <select id="type" className="input" value={form.data.type} onChange={(e) => form.setData('type', e.target.value)}>
                            {Object.entries(TYPE_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="label" htmlFor="title">Title</label>
                        <input id="title" type="text" className="input" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
                        {form.errors.title && <p className="mt-1 text-xs text-ember">{form.errors.title}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="content">Content</label>
                        <textarea id="content" rows={6} className="input" value={form.data.content} onChange={(e) => form.setData('content', e.target.value)} />
                        {form.errors.content && <p className="mt-1 text-xs text-ember">{form.errors.content}</p>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="label" htmlFor="event_date">Event date</label>
                            <input id="event_date" type="datetime-local" className="input" value={form.data.event_date} onChange={(e) => form.setData('event_date', e.target.value)} />
                        </div>
                        <div>
                            <label className="label" htmlFor="location">Location</label>
                            <input id="location" type="text" className="input" value={form.data.location} onChange={(e) => form.setData('location', e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <label className="label" htmlFor="fee">Contribution Fee (Urunan) — Rupiah</label>
                        <input id="fee" type="number" min="0" className="input" value={form.data.fee} onChange={(e) => form.setData('fee', e.target.value)} placeholder="Leave empty for free event" />
                        {form.errors.fee && <p className="mt-1 text-xs text-ember">{form.errors.fee}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="image">Replace image</label>
                        <input id="image" type="file" accept="image/*" className="input" onChange={(e) => form.setData('image', e.target.files[0])} />
                        {form.errors.image && <p className="mt-1 text-xs text-ember">{form.errors.image}</p>}
                    </div>

                    <label className="flex items-center gap-3">
                        <input type="checkbox" checked={form.data.is_published} onChange={(e) => form.setData('is_published', e.target.checked)} className="h-4 w-4 accent-gold" />
                        <span className="text-sm">Publish</span>
                    </label>

                    <div className="flex justify-end gap-3">
                        <a href={route('admin.community.index')} className="btn-ghost">Cancel</a>
                        <button type="submit" className="btn-gold" disabled={form.processing}>
                            {form.processing ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

CommunityEdit.layout = (page) => <AdminLayout>{page}</AdminLayout>;
