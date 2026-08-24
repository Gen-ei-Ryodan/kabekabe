export default function EmptyState({ title, description, action = null }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink/15 bg-white/60 px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink/5 text-2xl">
                ◌
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-ink">{title}</h3>
            {description && <p className="mt-1 max-w-sm text-sm text-slate">{description}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}