import { formatDate } from '@/Utils/format';

const STATUS_STYLES = {
    active: 'bg-sage/12 text-sage border-sage/25',
    inactive: 'bg-ember/10 text-ember border-ember/25',
    pending: 'bg-gold/15 text-gold-deep border-gold/30',
    approved: 'bg-sage/12 text-sage border-sage/25',
    rejected: 'bg-ember/10 text-ember border-ember/25',
    expired: 'bg-slate/10 text-slate border-slate/25',
};

export default function StatusChip({ status, label, expiresAt = null, pulse = false }) {
    const styles = STATUS_STYLES[status] || STATUS_STYLES.pending;

    return (
        <span className={`chip border ${styles}`}>
            {pulse && status === 'active' && (
                <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sage" />
                </span>
            )}
            {label || status}
            {expiresAt && <span className="opacity-70">· {formatDate(expiresAt)}</span>}
        </span>
    );
}