import ClientDashboard from "./ClientDashboard";
import { cleanUSZip } from "@/lib/zip";

export default function Page({
    searchParams,
}: {
    searchParams: { zip?: string };
}) {
    const initialZip = cleanUSZip(searchParams?.zip ?? "");
    return <ClientDashboard initialZip={initialZip} />;
}