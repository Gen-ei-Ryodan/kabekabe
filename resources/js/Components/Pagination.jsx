import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    if (!links || links.length <= 3) return null;

    const renderLink = (link) => {
        const isPrev = link.label.includes('Previous');
        const isNext = link.label.includes('Next');

        const label = isPrev
            ? '←'
            : isNext
              ? '→'
              : link.label;

        const className = `inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 font-mono text-xs font-semibold transition-colors ${
            link.active
                ? 'bg-ink text-paper'
                : link.url
                  ? 'text-ink hover:bg-ink/10'
                  : 'cursor-not-allowed text-slate-soft'
        }`;

        return link.url ? (
            <Link key={link.label} href={link.url} className={className} preserveScroll>
                {label}
            </Link>
        ) : (
            <span key={link.label} className={className}>
                {label}
            </span>
        );
    };

    return (
        <nav className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
            {links.map(renderLink)}
        </nav>
    );
}