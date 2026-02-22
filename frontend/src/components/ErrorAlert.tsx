'use client';

interface ErrorAlertProps {
    message: string;
    statusCode?: number;
}

const STATUS_LABELS: Record<number, string> = {
    400: 'Invalid URL',
    403: 'Private Content',
    404: 'Reel Not Found',
    422: 'Extraction Failed',
    429: 'Rate Limited',
    504: 'Request Timed Out',
    500: 'Server Error',
};

export default function ErrorAlert({ message, statusCode }: ErrorAlertProps) {
    const label = statusCode ? STATUS_LABELS[statusCode] : 'Error';

    return (
        <div
            role="alert"
            className="animate-fade-in flex items-start gap-3 p-4 rounded-xl
                 bg-rose-500/10 border border-rose-500/20 text-rose-300"
        >
            {/* Icon */}
            <svg
                className="w-5 h-5 mt-0.5 flex-shrink-0 text-rose-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
            </svg>

            <div className="min-w-0">
                <p className="font-semibold text-rose-300 text-sm">{label}</p>
                <p className="text-rose-400/80 text-sm mt-0.5 break-words">{message}</p>
            </div>
        </div>
    );
}
