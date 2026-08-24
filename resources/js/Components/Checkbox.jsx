export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'h-4 w-4 rounded border-ink/20 bg-white accent-gold focus:ring-gold ' +
                className
            }
        />
    );
}