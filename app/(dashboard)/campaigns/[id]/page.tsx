import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CampaignEditor } from "@/components/dashboard/campaign-editor";
import type { Campaign } from "@/lib/types";

export default async function CampaignEditPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data } = await supabase.from("campaigns").select("*").eq("id", params.id).single();
  if (!data) notFound();
  return <CampaignEditor campaign={data as Campaign} />;
}
