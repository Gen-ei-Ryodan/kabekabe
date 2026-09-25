import { Head, useForm } from '@inertiajs/react';
import VendorLayout from '@/Layouts/VendorLayout';

export default function PromoEdit({ promo }) {
    const form = useForm({
        title: promo.title,
        description: promo.description || '',
        discount_type: promo.discount_type,
        discount_value: String(promo.discount_value),
        min_purchase: String(promo.min_purchase),
        start_date: promo.start_date,
        end_date: promo.end_date,
        terms: promo.terms || '',
        logo: null,
        promo_image: null,
        product_image: null,
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(route('vendor.promos.update', promo.id), { preserveScroll: true, forceFormData: true });
    };

    return (
        <>
            <Head title="Revisi Promo" />

            <div className="mx-auto max-w-2xl">
                <header>
                    <p className="eyebrow">Promo Ditolak</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Revisi Promo</h1>
                    {promo.rejection_reason && (
                        <p className="mt-3 rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember">
                            Alasan penolakan: {promo.rejection_reason}
                        </p>
                    )}
                </header>

                <form onSubmit={submit} className="card-surface mt-8 space-y-6 p-6 sm:p-8">
                    <div>
                        <label className="label" htmlFor="title">Judul Promo</label>
                        <input id="title" type="text" className="input" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
                        {form.errors.title && <p className="mt-1 text-xs text-ember">{form.errors.title}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="description">Deskripsi</label>
                        <textarea id="description" rows={3} className="input" value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} />
                        {form.errors.description && <p className="mt-1 text-xs text-ember">{form.errors.description}</p>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="label" htmlFor="discount_type">Tipe Diskon</label>
                            <select id="discount_type" className="input" value={form.data.discount_type} onChange={(e) => form.setData('discount_type', e.target.value)}>
                                <option value="percent">Persentase (%)</option>
                                <option value="nominal">Nominal (Rp)</option>
                                <option value="free_item">Free Barang</option>
                            </select>
                        </div>
                        <div>
                            <label className="label" htmlFor="discount_value">
                                {form.data.discount_type === 'free_item'
                                    ? 'Nilai Barang (Rp)'
                                    : form.data.discount_type === 'percent'
                                    ? 'Besaran Diskon (%)'
                                    : 'Besaran Diskon (Rp)'}
                            </label>
                            <input id="discount_value" type="number" min="1" className="input" value={form.data.discount_value} onChange={(e) => form.setData('discount_value', e.target.value)} />
                            {form.errors.discount_value && <p className="mt-1 text-xs text-ember">{form.errors.discount_value}</p>}
                        </div>
                        <div>
                            <label className="label" htmlFor="min_purchase">Minimal Belanja (Rp)</label>
                            <input id="min_purchase" type="number" min="0" className="input" value={form.data.min_purchase} onChange={(e) => form.setData('min_purchase', e.target.value)} />
                            {form.errors.min_purchase && <p className="mt-1 text-xs text-ember">{form.errors.min_purchase}</p>}
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="label" htmlFor="start_date">Tanggal Mulai</label>
                            <input id="start_date" type="date" className="input" value={form.data.start_date} onChange={(e) => form.setData('start_date', e.target.value)} />
                            {form.errors.start_date && <p className="mt-1 text-xs text-ember">{form.errors.start_date}</p>}
                        </div>
                        <div>
                            <label className="label" htmlFor="end_date">Tanggal Berakhir</label>
                            <input id="end_date" type="date" className="input" value={form.data.end_date} onChange={(e) => form.setData('end_date', e.target.value)} />
                            {form.errors.end_date && <p className="mt-1 text-xs text-ember">{form.errors.end_date}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="label" htmlFor="terms">Syarat & Ketentuan</label>
                        <textarea id="terms" rows={2} className="input" value={form.data.terms} onChange={(e) => form.setData('terms', e.target.value)} />
                        {form.errors.terms && <p className="mt-1 text-xs text-ember">{form.errors.terms}</p>}
                    </div>

                    {/* Foto-foto Opsional */}
                    <div className="border-t border-ink/10 pt-6">
                        <p className="eyebrow mb-4">Foto Promo (Opsional)</p>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <label className="label" htmlFor="logo">Logo Perusahaan</label>
                                {promo.logo_url && (
                                    <div className="mb-2">
                                        <img src={promo.logo_url} alt="Logo saat ini" className="h-20 w-20 rounded-lg object-cover" />
                                        <p className="text-xs text-slate-soft">Foto saat ini</p>
                                    </div>
                                )}
                                <input
                                    id="logo"
                                    type="file"
                                    accept="image/*"
                                    className="input"
                                    onChange={(e) => form.setData('logo', e.target.files[0])}
                                />
                                {form.errors.logo && <p className="mt-1 text-xs text-ember">{form.errors.logo}</p>}
                                {form.data.logo && (
                                    <div className="mt-2">
                                        <img src={URL.createObjectURL(form.data.logo)} alt="Preview Logo" className="h-20 w-20 rounded-lg object-cover" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="label" htmlFor="promo_image">Foto Promo</label>
                                {promo.promo_image_url && (
                                    <div className="mb-2">
                                        <img src={promo.promo_image_url} alt="Foto promo saat ini" className="h-20 w-20 rounded-lg object-cover" />
                                        <p className="text-xs text-slate-soft">Foto saat ini</p>
                                    </div>
                                )}
                                <input
                                    id="promo_image"
                                    type="file"
                                    accept="image/*"
                                    className="input"
                                    onChange={(e) => form.setData('promo_image', e.target.files[0])}
                                />
                                {form.errors.promo_image && <p className="mt-1 text-xs text-ember">{form.errors.promo_image}</p>}
                                {form.data.promo_image && (
                                    <div className="mt-2">
                                        <img src={URL.createObjectURL(form.data.promo_image)} alt="Preview Promo" className="h-20 w-20 rounded-lg object-cover" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="label" htmlFor="product_image">Foto Produk</label>
                                {promo.product_image_url && (
                                    <div className="mb-2">
                                        <img src={promo.product_image_url} alt="Foto produk saat ini" className="h-20 w-20 rounded-lg object-cover" />
                                        <p className="text-xs text-slate-soft">Foto saat ini</p>
                                    </div>
                                )}
                                <input
                                    id="product_image"
                                    type="file"
                                    accept="image/*"
                                    className="input"
                                    onChange={(e) => form.setData('product_image', e.target.files[0])}
                                />
                                {form.errors.product_image && <p className="mt-1 text-xs text-ember">{form.errors.product_image}</p>}
                                {form.data.product_image && (
                                    <div className="mt-2">
                                        <img src={URL.createObjectURL(form.data.product_image)} alt="Preview Produk" className="h-20 w-20 rounded-lg object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-slate-soft">Format: JPG, PNG, atau WebP. Maksimal 2MB per file.</p>
                    </div>

                    <div className="flex justify-end gap-3">
                        <a href={route('vendor.promos.index')} className="btn-ghost">Batal</a>
                        <button type="submit" className="btn-gold" disabled={form.processing}>
                            {form.processing ? 'Mengirim…' : 'Ajukan Ulang'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

PromoEdit.layout = (page) => <VendorLayout>{page}</VendorLayout>;