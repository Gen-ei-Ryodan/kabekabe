import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function CommunityCreate() {
    const form = useForm({
        type: 'agenda',
        title: '',
        content: '',
        event_date: '',
        location: '',
        fee: '',
        image: null,
        is_published: true,
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('admin.community.store'), { preserveScroll: true });
    };

    return (
        <>
            <Head title="Buat Event" />

            <div className="mx-auto max-w-2xl">
                <header>
                    <p className="eyebrow">Event & Aktivitas</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Buat Event Baru</h1>
                </header>

                <form onSubmit={submit} className="card-surface mt-8 space-y-6 p-6 sm:p-8">
                    <div>
                        <label className="label" htmlFor="title">Judul Acara</label>
                        <input id="title" type="text" className="input" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
                        {form.errors.title && <p className="mt-1 text-xs text-ember">{form.errors.title}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="content">Deskripsi / Konten</label>
                        <textarea id="content" rows={6} className="input" value={form.data.content} onChange={(e) => form.setData('content', e.target.value)} />
                        {form.errors.content && <p className="mt-1 text-xs text-ember">{form.errors.content}</p>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="label" htmlFor="event_date">Tanggal & Waktu Acara</label>
                            <input id="event_date" type="datetime-local" className="input" value={form.data.event_date} onChange={(e) => form.setData('event_date', e.target.value)} />
                        </div>
                        <div>
                            <label className="label" htmlFor="location">Lokasi</label>
                            <input id="location" type="text" className="input" value={form.data.location} onChange={(e) => form.setData('location', e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <label className="label" htmlFor="fee">Biaya Kontribusi — Rupiah</label>
                        <input id="fee" type="number" min="0" className="input" value={form.data.fee} onChange={(e) => form.setData('fee', e.target.value)} placeholder="Kosongkan jika acara gratis" />
                        {form.errors.fee && <p className="mt-1 text-xs text-ember">{form.errors.fee}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="image">Gambar / Poster</label>
                        <input id="image" type="file" accept="image/*" className="input" onChange={(e) => form.setData('image', e.target.files[0])} />
                        {form.errors.image && <p className="mt-1 text-xs text-ember">{form.errors.image}</p>}
                    </div>

                    <label className="flex items-center gap-3">
                        <input type="checkbox" checked={form.data.is_published} onChange={(e) => form.setData('is_published', e.target.checked)} className="h-4 w-4 accent-gold" />
                        <span className="text-sm">Terbitkan langsung</span>
                    </label>

                    <div className="flex justify-end gap-3">
                        <a href={route('admin.community.index')} className="btn-ghost">Batal</a>
                        <button type="submit" className="btn-gold" disabled={form.processing}>
                            {form.processing ? 'Menyimpan…' : 'Simpan Event'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

CommunityCreate.layout = (page) => <AdminLayout>{page}</AdminLayout>;
