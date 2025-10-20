export default function Footer() {
    return (
        <footer className="mt-10 border-t border-white/10 bg-black/40 backdrop-blur">
            <div className="container py-6 text-sm text-white/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>© {new Date().getFullYear()} EMONEY Deals</div>
                <div className="flex items-center gap-4">
                    <a href="/privacy" className="hover:text-white">Privacy</a>
                    <a href="/terms" className="hover:text-white">Terms</a>
                </div>
            </div>
        </footer>
    );
}