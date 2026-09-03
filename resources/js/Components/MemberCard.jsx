import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import QrCode from '@/Components/QrCode';
import Avatar from '@/Components/Avatar';
import Modal from '@/Components/Modal';
import { formatDateEn } from '@/Utils/format';

export default function MemberCard({ member }) {
    const wrapRef = useRef(null);
    const cardRef = useRef(null);
    const sheenRef = useRef(null);
    const [photoOpen, setPhotoOpen] = useState(false);

    useEffect(() => {
        const wrap = wrapRef.current;
        const card = cardRef.current;
        const sheen = sheenRef.current;
        if (!wrap || !card) return;

        const mm = gsap.matchMedia();

        mm.add({ reduceMotion: '(prefers-reduced-motion: reduce)' }, (ctx) => {
            const { reduceMotion } = ctx.conditions;

            if (reduceMotion) return;

            const timeline = gsap.timeline({
                defaults: { ease: 'power3.out' },
            });

            timeline
                .fromTo(card, { autoAlpha: 0, rotationY: -32, rotationX: 10, y: 48, scale: 0.94 }, { autoAlpha: 1, rotationY: 0, rotationX: 0, y: 0, scale: 1, duration: 1.1 })
                .fromTo(
                    '.card-line',
                    { autoAlpha: 0, y: 10 },
                    { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 },
                    '-=0.5',
                )
                .fromTo(
                    sheen,
                    { xPercent: -130, autoAlpha: 0.9 },
                    { xPercent: 130, autoAlpha: 0, duration: 1.1, ease: 'power2.inOut' },
                    '-=0.4',
                );

            gsap.to(card, { y: -6, duration: 3.2, yoyo: true, repeat: -1, ease: 'sine.inOut' });

            return () => timeline.kill();
        });

        const handleMove = (e) => {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

            const rect = wrap.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5;
            const py = (e.clientY - rect.top) / rect.height - 0.5;

            gsap.to(card, {
                rotationY: px * 16,
                rotationX: -py * 14,
                transformPerspective: 900,
                duration: 0.6,
                ease: 'power2.out',
            });
        };

        const handleLeave = () => {
            gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.8, ease: 'power3.out' });
        };

        wrap.addEventListener('mousemove', handleMove);
        wrap.addEventListener('mouseleave', handleLeave);

        return () => {
            wrap.removeEventListener('mousemove', handleMove);
            wrap.removeEventListener('mouseleave', handleLeave);
            mm.revert();
        };
    }, []);

    const isActive = member.membership_status === 'active';

    return (
        <div ref={wrapRef} className="relative [perspective:1200px]">
            <div
                ref={cardRef}
                className="relative min-h-[18rem] w-full max-w-full overflow-hidden rounded-3xl border border-gold/40 bg-ink shadow-card will-change-transform sm:mx-auto sm:max-w-md"
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Card base image */}
                <img
                    src="/bglogin.png"
                    alt="Member card background"
                    className="absolute inset-0 h-full w-full select-none object-cover"
                    draggable="false"
                />

                {/* Content overlay */}
                <div className="absolute inset-0 flex flex-col">
                    {/* Readability overlays */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-ink/60 via-ink/30 to-transparent" />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/40" />

                    {/* sheen sweep */}
                    <div
                        ref={sheenRef}
                        className="pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        style={{ transform: 'translateX(-130%)', visibility: 'hidden' }}
                    />

                    {/* top row: photo right */}
                    <div className="card-line relative flex items-start justify-end px-4 pt-4 sm:px-6 sm:pt-6">
                        <button
                            type="button"
                            onClick={() => setPhotoOpen(true)}
                            className="group relative h-20 w-20 cursor-pointer overflow-hidden rounded-xl border-2 border-gold shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold/70 sm:h-28 sm:w-28"
                            aria-label="Lihat foto"
                        >
                            <Avatar
                                src={member.avatar_url}
                                name={member.name}
                                tone="dark"
                                className="h-20 w-20 text-2xl sm:h-28 sm:w-28 sm:text-3xl"
                            />
                            <span className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors group-hover:bg-ink/20">
                                <svg className="h-5 w-5 text-paper opacity-0 drop-shadow transition-opacity group-hover:opacity-100 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                            </span>
                        </button>
                    </div>

                    {/* bottom area: QR left, info right */}
                    <div className="relative mt-auto flex items-end gap-4 px-4 pb-5 sm:gap-6 sm:px-6 sm:pb-8">
                        {/* QR */}
                        <div className="card-line flex flex-col gap-1.5 sm:gap-2">
                            <QrCode value={member.card_token} size={72} className="rounded-lg bg-white p-1 shadow-md" />
                            <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-paper/70 drop-shadow sm:text-[9px]">
                                Scan here
                            </div>
                        </div>

                        {/* info right */}
                        <div className="card-line flex min-w-0 flex-1 flex-col gap-1.5 sm:gap-2">
                            <div className="flex items-center justify-between gap-3">
                                <p className="truncate font-display text-lg font-bold text-paper drop-shadow sm:text-xl">
                                    {member.name}
                                </p>
                                <span
                                    className={`chip shrink-0 border px-2 py-0.5 text-[10px] font-semibold shadow sm:text-xs ${
                                        isActive
                                            ? 'border-sage bg-sage text-white'
                                            : 'border-ember bg-ember text-white'
                                    }`}
                                >
                                    {isActive && (
                                        <span className="relative flex h-1.5 w-1.5">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
                                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
                                        </span>
                                    )}
                                    {member.membership_status_label}
                                </span>
                            </div>

                            <p className="font-mono text-[10px] tracking-wider text-gold-light drop-shadow sm:text-[11px]">
                                {member.member_code}
                            </p>

                            <div className="flex items-end justify-between gap-3">
                                <div>
                                    <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-paper/70 drop-shadow sm:text-[9px]">Joined</div>
                                    <div className="font-display text-xs font-bold text-paper drop-shadow sm:text-sm">
                                        {member.joined_at}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-paper/70 drop-shadow sm:text-[9px]">Valid until</div>
                                    <div className="font-display text-xs font-bold text-paper drop-shadow sm:text-sm">
                                        {member.expires_at ? formatDateEn(member.expires_at) : '—'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>

                {/* Non-active overlay */}
                {!isActive && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-ink/60 backdrop-blur-[2px]">
                        <svg
                            className="h-32 w-32 text-ember/90 drop-shadow-lg sm:h-40 sm:w-40"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.2}
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        <div className="absolute rounded-2xl border border-ember/50 bg-ember/90 px-5 py-2.5 text-center shadow-lg">
                            <p className="font-display text-sm font-bold text-white">Membership Inactive</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Photo lightbox */}
            <Modal
                show={photoOpen}
                maxWidth="lg"
                closeable={true}
                onClose={() => setPhotoOpen(false)}
            >
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-ink">
                    {member.avatar_url ? (
                        <img
                            src={member.avatar_url}
                            alt={member.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <span className="font-display text-8xl font-bold text-gold">
                                {member.name?.charAt(0) || 'M'}
                            </span>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
