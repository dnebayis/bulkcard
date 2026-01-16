export default function NotFound() {
    return (
        <div className="min-h-screen bg-bulk-bg flex items-center justify-center px-6">
            <div className="text-center space-y-6 max-w-md">
                <div className="space-y-2">
                    <h1 className="text-6xl font-bold text-bulk-text">404</h1>
                    <h2 className="text-2xl font-bold text-bulk-muted">Page Not Found</h2>
                </div>
                <p className="text-bulk-muted">
                    The page you're looking for doesn't exist.
                </p>
                <a
                    href="/"
                    className="inline-block px-6 py-3 bg-bulk-accent text-bulk-bg font-semibold text-sm uppercase tracking-wide hover:bg-[#16a980] transition-all duration-150"
                >
                    Return Home
                </a>
            </div>
        </div>
    );
}
