import { useForm } from '@inertiajs/react';
import SlideOver from '@/Components/SlideOver';

export default function ImportDrawer({ title, subtitle, columns, templateHref, uploadRoute, onClose }) {
    const form = useForm({ file: null });

    const submit = (e) => {
        e.preventDefault();
        form.post(uploadRoute, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <SlideOver open onClose={onClose} title={title} subtitle={subtitle} width="max-w-xl">
            <form onSubmit={submit} className="space-y-5">
                <section className="rounded-2xl border border-ink/10 bg-paper p-5">
                    <h2 className="font-display text-lg font-bold">1. Download the template</h2>
                    <p className="mt-1.5 text-sm text-slate">
                        Fill the spreadsheet following the column order below. The first row must stay as the header.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {columns.map((column) => (
                            <span key={column} className="chip border border-gold/30 bg-gold/10 text-gold-deep">
                                {column}
                            </span>
                        ))}
                    </div>
                    <a href={templateHref} className="btn-ghost mt-4">
                        ↓ Download template (.xlsx)
                    </a>
                </section>

                <section className="rounded-2xl border border-ink/10 bg-paper p-5">
                    <h2 className="font-display text-lg font-bold">2. Upload your file</h2>
                    <p className="mt-1.5 text-sm text-slate">Accepted formats: .xlsx or .csv, max 5 MB.</p>

                    <label className="btn-ghost mt-4 cursor-pointer">
                        {form.data.file ? `${form.data.file.name} ✓` : 'Choose file…'}
                        <input
                            type="file"
                            accept=".xlsx,.csv"
                            className="hidden"
                            onChange={(e) => form.setData('file', e.target.files[0])}
                        />
                    </label>
                    {form.errors.file && <p className="mt-1.5 text-xs text-ember">{form.errors.file}</p>}
                </section>

                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
                    <button type="submit" className="btn-gold" disabled={!form.data.file || form.processing}>
                        {form.processing ? 'Importing…' : 'Start Import'}
                    </button>
                </div>
            </form>
        </SlideOver>
    );
}
