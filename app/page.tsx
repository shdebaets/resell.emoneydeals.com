"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import RotatingHeadline from "@/components/RotatingHeadline";
import ScanOverlay from "@/components/ScanOverlay";
import { isUSZip, cleanUSZip } from "@/lib/zip";
import SuccessBackdrop from "@/components/SuccessBackdrop";
import ProofStrip from "@/components/ProofStrip";
import { gaEvent } from "@/app/(lib)/ga";

export default function Landing() {
  const r = useRouter();
  const qp = useSearchParams();
  const utm = useMemo(() => new URLSearchParams(qp ?? undefined).toString(), [qp]);
  const [zip, setZip] = useState("");
  const [scanning, setScanning] = useState(false);

  const go = () => {
    const z = cleanUSZip(zip);
    if (!isUSZip(z)) return alert("Enter a valid US ZIP (e.g., 33101 or 33101-1234).");
    setScanning(true);
  };

  const finalizeRoute = () => {
    const z = cleanUSZip(zip);
    const qs = new URLSearchParams({ zip: z, fsrc: "landing" });
    if (utm) new URLSearchParams(utm).forEach((v, k) => qs.append(k, v));

    // gaEvent("zip_submit", { zip: z });

    // r.push(`/dashboard?${qs.toString()}`);
  };

  return (
    <div>
      <section className="relative container min-h-[calc(100dvh-4rem)] grid items-center py-10">
        <SuccessBackdrop
          images={[
            "/success/906214d1-f74a-427a-9745-0d76e76ce16b.png",
            "/success/78bd80e2-2c2b-4a68-ac30-89ce9dbed60d.png",
            "/success/949ca9d4-5f82-4a40-9c87-2a61e22d27c0.jpg",
            "/success/99078559-e25f-42c7-a691-fe0b4e88c05b.jpg",
            "/success/4dbf0823-7ec7-48ec-9786-c041503fcd2b.png",
            "/success/6908e66c-668f-4501-83fe-6770a5f3b024.jpg",
            "/success/4dcb9289-bdc5-4c28-81e7-96d6015fe614.png",
            "/success/ebbbaa5a-3ca0-47f0-a1cb-d66a8f1dac12.png",
            "/success/8e4b238e-381b-4873-a0a2-dc236bfc18b7.jpg",
            "/success/659a7d01-ff20-4a5a-9710-358b841ac6df.png",
            "/success/01c6e90b-dad7-4cc2-a0aa-550f02fcc6c7.webp",
            "/success/16a091d8-1bd7-4cc2-907c-912882b40172.png",
            "/success/0fd30ad2-0f84-4a4f-860f-a304b324937d.png",
            "/success/c21df215-c58f-4ec5-a8a9-ceaa5ba6b93e.png",
            "/success/b946e987-dc13-4221-ac4d-03814d260d4f.png",
            "/success/d0406031-3b89-465d-a7ea-748bd78e36ef.jpg",
            "/success/91702644-8188-4f87-b262-7fd40c5d9d7d.webp",
            "/success/5f57b9c0-9787-4e21-b151-4127b3cb8a21.png",
            "/success/33c67520-e042-4663-9b6e-59821aaf4bce.jpg",
            "/success/75e866bf-18a8-44af-8b58-f4138f8f216c.png",
            "/success/5808a9ff-16c6-46db-9c01-59438a18a67e.png",
            "/success/54e6f19c-c305-48d5-ac3e-10cb5ddfbf77.png",
            "/success/f3e8b141-d4bd-48a2-868b-b108529c0817.png",
            "/success/124f290b-24df-4fec-b09e-7778f4c33e13.png",
            "/success/f5244fa5-14bd-4087-a1aa-355f5099aebf.png",
            "/success/86b87719-9c9b-4abe-adb5-f1298b3c5d78.jpg",
            "/success/d96cb7ff-a02d-4f25-a219-f24e54c570ec.jpg",
            "/success/d0b30164-43ed-49ba-8d6f-841e06c90163.png",
            "/success/4654a519-5932-46a2-bf13-0abed17ff2be.png",
            "/success/f6fc6f6f-db0c-4319-8b99-58fcca0f11fa.png",
            "/success/a4991336-170a-438a-9b32-193a41b3ae9a.jpg",
            "/success/cc26c58d-4d4b-4ac1-8d73-a72bb721e5ab.jpg",
            "/success/eed59033-fe4f-4343-834c-0178c65d9f09.jpg",
            "/success/c5477e7d-9777-4808-9cb8-5269f43eb5b1.jpg",
            "/success/74ff36d5-92dd-446d-8484-f132c621c58c.png",
            "/success/2b49ffdc-7333-4ea7-8c24-f4d57eb0280e.png",
            "/success/bbf1594e-91b4-45dd-be13-7b2ee8067a3d.jpg",
            "/success/198fdf17-948f-4f7d-8af2-cabe976aa30e.jpg"
          ]}
          parallaxIntensity={0.1}
        />
        <div className="mx-auto z-10 max-w-[46rem] text-center">
          <RotatingHeadline />
          <p className="mt-4 text-white/80">
            Enter your ZIP to see what’s popping near you. No distractions, just results.
          </p>

          <div className="mt-8 mx-auto flex w-full max-w-md gap-3">
            <input
              autoFocus
              className="input text-center text-lg"
              placeholder="Enter US ZIP (e.g., 33101)"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && go()}
            />
            <button className="btn btn-primary" onClick={go}>Search</button>
          </div>
          <p className="mt-2 text-xs text-white/60">US ZIP codes only.</p>

          <ProofStrip />
        </div>
      </section>

      {scanning && <ScanOverlay zip={cleanUSZip(zip)} onDone={finalizeRoute} />}
    </div>
  );
}