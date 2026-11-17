"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "../../../lib/supabase/browser";

/** Refreshes the page's server-rendered feed when a scan is recorded anywhere, including on a staff phone. */
export function LiveScanFeed({ facilityId }: { facilityId: string }) {
  const router = useRouter();
  useEffect(() => {
    const supabase = getBrowserSupabase();
    const channel = supabase
      .channel(`facility-scans:${facilityId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "access_scans", filter: `facility_id=eq.${facilityId}` },
        () => router.refresh(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [facilityId, router]);
  return null;
}
