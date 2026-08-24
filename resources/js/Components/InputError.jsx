export default function InputError({ message, className = '', ...props }) {
    return message ? (
        <p
            {...props}
            className={'text-xs text-ember ' + className}
        >
            {message}
        </p>
    ) : null;
}