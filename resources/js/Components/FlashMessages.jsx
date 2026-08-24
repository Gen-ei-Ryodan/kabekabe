import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import gsap from 'gsap';

export default function FlashMessages() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(false);
    const [current, setCurrent] = useState(null);

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setCurrent(flash);
            setVisible(true);

            const timer = setTimeout(() => setVisible(false), 4000);

            return () => clearTimeout(timer);
        }
    }, [flash]);

    useEffect(() => {
        if (!visible || !current) return;

        const ctx = gsap.context(() => {
            gsap.fromTo('.flash-toast', { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: 'power3.out' });
        });

        return () => ctx.revert();
    }, [visible, current]);

    if (!visible || !current) return null;

    const isSuccess = Boolean(current.success);

    return (
        <div className="pointer-events-none fixed inset-x-0 top-5 z-[100] flex justify-center px-4">
            <div className={`flash-toast pointer-events-auto flex max-w-md items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-card backdrop-blur ${isSuccess ? 'border-sage/30 bg-sage text-white' : 'border-ember/30 bg-ember text-white'}`}>
                <span className="mt-0.5 shrink-0">{isSuccess ? '✓' : '!'}</span>
                <span>{isSuccess ? current.success : current.error}</span>
            </div>
        </div>
    );
}