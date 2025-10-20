import ClientDashboard from "./ClientDashboard";
import { cleanUSZip } from "@/lib/zip";
import { Suspense } from "react";

export default function Page({
    searchParams,
}: {
    searchParams: { zip?: string };
}) {
    const initialZip = cleanUSZip(searchParams?.zip ?? "");
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ClientDashboard initialZip={initialZip} />
        </Suspense>
    );
}