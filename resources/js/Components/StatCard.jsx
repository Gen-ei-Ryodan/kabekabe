import { Reveal } from '@/Components/Reveal';

export default function StatCard({ label, value, sub, tone = 'ink', icon = null }) {
    const tones = {
        ink: 'from-ink to-ink-soft text-paper',
        gold: 'from-gold to-gold-light text-ink',
        sage: 'from-sage to-sage-deep text-white',
        ember: 'from-ember to-ember-deep text-white',
        paper: 'border border-ink/10 bg-white/80 text-ink',
    };

    return (
        <Reveal className="h-full">
            <div className={`relative overflow-hidden rounded-2xl p-5 shadow-lift ${tones[tone]}`}>
                {icon && <div className="absolute -right-3 -top-3 opacity-10">{icon}</div>}
                <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] opacity-70">{label}</div>
                <div className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">{value}</div>
                {sub && <div className="mt-1 text-xs opacity-70">{sub}</div>}
            </div>
        </Reveal>
    );
}