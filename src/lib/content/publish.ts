import { getSupabaseServerClient } from "@/lib/supabase/server";

type PublishInput = {
  table: "event_pages" | "articles" | "halls" | "promotions" | "testimonials";
  recordId: string;
  slug?: string;
};

/**
 * Публикует выбранную запись и архивирует предыдущую published-версию с тем же slug.
 * Используется в будущем админ-контуре /admin.
 */
export async function publishAndArchivePrevious(input: PublishInput): Promise<void> {
  const client = getSupabaseServerClient();
  if (!client) return;

  if (input.slug) {
    await client
      .from(input.table)
      .update({ status: "archived", archived_at: new Date().toISOString() })
      .eq("slug", input.slug)
      .eq("status", "published")
      .neq("id", input.recordId);
  }

  await client
    .from(input.table)
    .update({
      status: "published",
      published_at: new Date().toISOString(),
      archived_at: null
    })
    .eq("id", input.recordId);
}
