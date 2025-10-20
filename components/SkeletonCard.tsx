export default function SkeletonCard() {
    return (
        <div className="card p-3 animate-pulse">
            <div className="aspect-[4/3] rounded-xl bg-white/10" />
            <div className="mt-3 h-4 w-5/6 rounded bg-white/10" />
            <div className="mt-2 h-3 w-2/3 rounded bg-white/10" />
            <div className="mt-3 flex gap-2">
                <div className="h-5 w-16 rounded bg-white/10" />
                <div className="h-5 w-16 rounded bg-white/10" />
            </div>
        </div>
    );
}