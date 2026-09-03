import { useForm } from '@inertiajs/react';
import SlideOver from '@/Components/SlideOver';

function CreateCommunityDrawer({ onClose }) {
    const form = useForm({
        type: 'agenda',
        title: '',
        content: '',
        event_date: '',
        location: '',
        image: null,
        is_published: true,
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('admin.community.store'), { preserveScroll: true });
    };

    return (
        <form id="community-form" onSubmit={submit} className="space-y-5">
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
                <label className="label" htmlFor="image">Image</label>
                <input id="image" type="file" accept="image/*" className="input" onChange={(e) => form.setData('image', e.target.files[0])} />
                {form.errors.image && <p className="mt-1 text-xs text-ember">{form.errors.image}</p>}
            </div>

            <label className="flex items-center gap-3">
                <input type="checkbox" checked={form.data.is_published} onChange={(e) => form.setData('is_published', e.target.checked)} className="h-4 w-4 accent-gold" />
                <span className="text-sm">Publish immediately</span>
            </label>

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-gold" disabled={form.processing}>
                    {form.processing ? 'Saving…' : 'Save Event'}
                </button>
            </div>
        </form>
    );
}

function EditCommunityDrawer({ info, onClose }) {
    const form = useForm({
        type: info.type,
        title: info.title,
        content: info.content,
        event_date: info.event_date || '',
        location: info.location || '',
        image: null,
        is_published: Boolean(info.is_published),
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(route('admin.community.update', info.id), { preserveScroll: true });
    };

    return (
        <form id="community-form" onSubmit={submit} className="space-y-5">
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
                <label className="label" htmlFor="image">Replace image</label>
                <input id="image" type="file" accept="image/*" className="input" onChange={(e) => form.setData('image', e.target.files[0])} />
                {form.errors.image && <p className="mt-1 text-xs text-ember">{form.errors.image}</p>}
            </div>

            <label className="flex items-center gap-3">
                <input type="checkbox" checked={form.data.is_published} onChange={(e) => form.setData('is_published', e.target.checked)} className="h-4 w-4 accent-gold" />
                <span className="text-sm">Publish</span>
            </label>

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-gold" disabled={form.processing}>
                    {form.processing ? 'Saving…' : 'Save'}
                </button>
            </div>
        </form>
    );
}

export default function CommunityDrawer({ drawer, onClose }) {
    if (!drawer?.mode) return null;

    const meta = {
        create: ['Create Event', 'Create an event or activity.'],
        edit: ['Edit Event', drawer.info?.title],
    };

    const [title, subtitle] = meta[drawer.mode] || ['', ''];

    return (
        <SlideOver open onClose={onClose} title={title} subtitle={subtitle} width="max-w-2xl">
            {drawer.mode === 'create' && <CreateCommunityDrawer onClose={onClose} />}
            {drawer.mode === 'edit' && <EditCommunityDrawer key={drawer.info?.id} info={drawer.info} onClose={onClose} />}
        </SlideOver>
    );
}
