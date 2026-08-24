export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={`btn-gold ${
                disabled && 'opacity-40'
            } ` + className}
            disabled={disabled}
        >
            {children}
        </button>
    );
}