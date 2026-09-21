import { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import gsap from 'gsap';

export default function FlashMessages() {
    const { flash } = usePage().props;
    const [current, setCurrent] = useState(null);
    const timerRef = useRef(null);

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setCurrent(flash);

            if (timerRef.current) clearTimeout(timerRef.current);

            requestAnimationFrame(() => {
                gsap.fromTo('.flash-toast', { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: 'power3.out' });
            });

            timerRef.current = setTimeout(() => {
                gsap.to('.flash-toast', {
                    y: -12, autoAlpha: 0, duration: 0.3, ease: 'power2.in',
                    onComplete: () => setCurrent(null),
                });
            }, 3000);
        }

        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [flash]);

    if (!current) return null;

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