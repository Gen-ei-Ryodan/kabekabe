import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);
    const [visible, setVisible] = useState(false);

    const isPassword = type === 'password';
    const effectiveType = isPassword && visible ? 'text' : type;

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <div className="relative">
            <input
                {...props}
                type={effectiveType}
                className={
                    'input ' + (isPassword ? 'pr-12 ' : '') + className
                }
                style={isPassword ? { paddingRight: '3rem', ...(props.style || {}) } : props.style}
                ref={localRef}
            />

            {isPassword && (
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') e.preventDefault();
                    }}
                    aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}
                    aria-pressed={visible}
                    tabIndex={0}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition-colors hover:text-gold-deep focus:outline-none focus-visible:text-gold-deep"
                >
                    {visible ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5"
                            aria-hidden="true"
                        >
                            <path d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.774 3.162 10.066 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243" />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5"
                            aria-hidden="true"
                        >
                            <path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                    )}
                </button>
            )}
        </div>
    );
});
