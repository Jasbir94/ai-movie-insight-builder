import './globals.css';

export const metadata = {
    title: 'Movie Insight Builder | AI Movie Analysis',
    description: 'The ultimate AI-powered movie insight tool. Discover real audience sentiment, YouTube trailer stats, and deep-dive cast credits with precision.',
    icons: {
        icon: '/logo.png',
        shortcut: '/logo.png',
        apple: '/logo.png',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/logo.png" sizes="any" />
            </head>
            <body>
                {children}
            </body>
        </html>
    );
}
