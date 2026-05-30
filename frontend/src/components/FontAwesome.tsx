'use client';

export default function FontAwesome() {
    return (
        <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
            media="print"
            onLoad={(event) => {
                (event.target as HTMLLinkElement).media = 'all';
            }}
            crossOrigin="anonymous"
        />
    );
}
