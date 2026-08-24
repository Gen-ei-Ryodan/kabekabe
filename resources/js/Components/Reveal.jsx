import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function Reveal({ children, className = '', delay = 0, y = 28, as: Tag = 'div', ...props }) {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const mm = gsap.matchMedia();

        mm.add({ reduceMotion: '(prefers-reduced-motion: reduce)' }, (ctx) => {
            const { reduceMotion } = ctx.conditions;

            if (reduceMotion) return;

            const anim = gsap.fromTo(
                el,
                { autoAlpha: 0, y },
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.7,
                    delay,
                    ease: 'power3.out',
                    scrollTrigger: { trigger: el, start: 'top 88%', once: true },
                },
            );

            return () => anim.scrollTrigger?.kill();
        });

        return () => mm.revert();
    }, [delay, y]);

    return (
        <Tag ref={ref} className={className} {...props}>
            {children}
        </Tag>
    );
}

export default Reveal;