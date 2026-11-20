"use server";

import { z } from "zod";
import { requireSuiteSession } from "../../lib/active-facility";
import { describeDbError, type ActionResult, type FormState } from "../../lib/form-state";
import { formatDateTime } from "../../lib/format";
import { createServerSupabase } from "../../lib/supabase/server";

const postSchema = z
  .object({
    body: z.string().trim().min(1, "Write something to post").max(1000, "Keep posts to 1,000 characters"),
    link: z.union([z.literal(""), z.string().regex(/^(event|plan):[0-9a-f-]{36}$/)]),
    when: z.enum(["now", "later"]),
    date: z.string(),
    time: z.string(),
    alsoInbox: z.boolean(),
  })
  .transform((value, ctx) => {
    let publishAt: Date | null = null;
    if (value.when === "later") {
      // Entered in Manila time, like every other time in the suite.
      publishAt = new Date(`${value.date}T${value.time}:00+08:00`);
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(value.date) ||
        !/^\d{2}:\d{2}$/.test(value.time) ||
        Number.isNaN(publishAt.getTime())
      ) {
        ctx.addIssue({ code: "custom", message: "Choose the date and time to publish" });
      } else if (publishAt.getTime() <= Date.now()) {
        ctx.addIssue({ code: "custom", message: "Choose a time in the future, or publish now" });
      }
    }
    const [kind, id] = value.link ? value.link.split(":") : [null, null];
    return { ...value, publishAt, eventId: kind === "event" ? id : null, productId: kind === "plan" ? id : null };
  });

/** Publish a post to the business's followers and members, now or at a set time. */
export async function createPost(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = postSchema.safeParse({
    body: formData.get("body") ?? "",
    link: formData.get("link") ?? "",
    when: formData.get("when") ?? "now",
    date: formData.get("date") ?? "",
    time: formData.get("time") ?? "",
    alsoInbox: formData.get("alsoInbox") === "on",
  });
  if (!parsed.success) return { status: "form_validation", message: parsed.error.issues[0]?.message };

  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const scheduled = parsed.data.publishAt !== null;
  const { error } = await supabase.from("business_posts").insert({
    facility_id: active.id,
    body: parsed.data.body,
    event_id: parsed.data.eventId,
    product_id: parsed.data.productId,
    status: scheduled ? "SCHEDULED" : "PUBLISHED",
    publish_at: (parsed.data.publishAt ?? new Date()).toISOString(),
  });
  if (error) {
    return {
      status: "error",
      message: describeDbError(
        error,
        { INVALID_POST_LINK: "That event or plan is no longer available. Choose another." },
        "We couldn't save the post. Please retry.",
      ),
    };
  }
  if (scheduled) {
    return {
      status: "success",
      message: `Scheduled for ${formatDateTime(parsed.data.publishAt!.toISOString())}. It goes live on its own.`,
    };
  }

  // The inbox reaches members in the app today, so a post can go there as well.
  if (parsed.data.alsoInbox) {
    const { data: sent, error: sendError } = await supabase.rpc("send_crm_broadcast", {
      p_facility_id: active.id,
      p_suite_mode: active.registryType === "COMMERCIAL" ? "GYMDASH" : "CLUBDASH",
      p_audience: "ALL",
      p_title: `New from ${active.name}`.slice(0, 120),
      p_body: parsed.data.body,
    });
    if (sendError)
      return { status: "success", message: "Posted. The inbox copy could not be sent; send it from Inbox." };
    const count = z.object({ recipient_count: z.number() }).safeParse(sent);
    return {
      status: "success",
      message: `Posted, and sent to ${count.success ? count.data.recipient_count : "your"} members' inboxes.`,
    };
  }
  return { status: "success", message: "Posted." };
}

const idSchema = z.string().uuid();

async function updatePost(
  postId: string,
  change: { status: "PUBLISHED" | "ARCHIVED"; publish_at?: string },
  done: string,
): Promise<ActionResult> {
  const parsed = idSchema.safeParse(postId);
  if (!parsed.success) return { ok: false, message: "That post could not be found." };
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("business_posts")
    .update(change)
    .eq("id", parsed.data)
    .eq("facility_id", active.id);
  if (error) return { ok: false, message: describeDbError(error, {}, "We couldn't update the post. Please retry.") };
  return { ok: true, message: done };
}

/** Put a scheduled post live straight away. */
export async function publishPostNow(postId: string): Promise<ActionResult> {
  return updatePost(postId, { status: "PUBLISHED", publish_at: new Date().toISOString() }, "Posted.");
}

/** Take a post down, or cancel one that has not gone out yet. It stays in your history. */
export async function archivePost(postId: string): Promise<ActionResult> {
  return updatePost(postId, { status: "ARCHIVED" }, "Post removed.");
}
