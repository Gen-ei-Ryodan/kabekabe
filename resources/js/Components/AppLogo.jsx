export default function AppLogo({ dark = false, className = 'h-8 w-auto' }) {
    return (
        <img
            src="/images/logoafter.png"
            alt="KBKB - Komunitas Bisnis Katolik Bali"
            className={`inline-block ${className}`}
        />
    );
}
