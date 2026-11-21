import { CalendarClock, Megaphone } from "lucide-react";
import { WORKSPACES } from "sodia-core";
import { ActionButton } from "../../../components/ui/action-button";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { EmptyState, Notice, PageHeader, StatCard } from "../../../components/ui/states";
import { requireSection } from "../../../lib/active-facility";
import { loadPostDesk, type BusinessPost } from "../../../lib/data/posts";
import { formatDateTime, initialsOf } from "../../../lib/format";
import { archivePost, publishPostNow } from "../../actions/posts";
import { Composer } from "./Composer";

export const metadata = { title: "Posts" };

/** A post as followers see it: the business as the author, the text, and what it points to. */
function PostCard({
  post,
  businessName,
  children,
}: {
  post: BusinessPost;
  businessName: string;
  children?: React.ReactNode;
}) {
  return (
    <li className="rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background"
          >
            {initialsOf(businessName)}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold">{businessName}</span>
            <span className="block text-sm text-muted-foreground">
              {post.isLive ? `Posted ${formatDateTime(post.publishAt)}` : `Goes live ${formatDateTime(post.publishAt)}`}
            </span>
          </span>
        </div>
        {children}
      </div>
      <p className="mt-3 text-base whitespace-pre-line">{post.body}</p>
      {post.linkLabel && (
        <p className="mt-3 inline-flex rounded-lg bg-muted px-3 py-1.5 text-sm font-semibold">{post.linkLabel}</p>
      )}
    </li>
  );
}

export default async function PostsPage() {
  const { active } = await requireSection("posts");
  const desk = await loadPostDesk(active.id);
  const workspace = WORKSPACES[active.kind];
  const live = desk.posts.filter((post) => post.isLive && post.status !== "ARCHIVED");
  const scheduled = desk.posts
    .filter((post) => post.status === "SCHEDULED" && !post.isLive)
    .sort((a, b) => a.publishAt.localeCompare(b.publishAt));

  return (
    <>
      <PageHeader
        title="Posts"
        description={`Speak as ${active.name}. Posts go to the people who follow you and to your ${workspace.people.many}.`}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="People you reach"
          value={String(desk.audience.reach)}
          hint="Followers and members, counted once"
        />
        <StatCard label="Followers" value={String(desk.audience.followers)} hint="Follow your profile in the app" />
        <StatCard label="Live posts" value={String(live.length)} />
        <StatCard label="Scheduled" value={String(scheduled.length)} hint="Go live on their own" />
      </div>

      <div className="mb-6">
        <Notice tone="warning" role="note">
          Posts are stored and scheduled today. They appear on your profile and in followers&apos; feeds once the Sodia
          app&apos;s next update adds business profiles. To reach people right now, tick &quot;Also send to
          members&apos; inboxes&quot; when you post.
        </Notice>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="self-start lg:col-span-2">
          <CardHeader>
            <CardTitle>New post</CardTitle>
          </CardHeader>
          <CardContent>
            <Composer
              events={desk.links.events}
              plans={desk.links.plans.map((plan) => ({ id: plan.id, name: plan.name }))}
              planWord={active.kind === "COACH" ? "package" : "plan"}
              hasMembers={desk.audience.members > 0}
            />
            <p className="mt-2 text-sm text-muted-foreground">Times are in Philippine time.</p>
          </CardContent>
        </Card>

        <div className="grid gap-6 self-start lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Coming up</CardTitle>
              <Badge>{scheduled.length} scheduled</Badge>
            </CardHeader>
            <CardContent>
              {scheduled.length === 0 ? (
                <EmptyState
                  icon={CalendarClock}
                  title="Nothing scheduled"
                  description="Write a post and choose a set time. It goes live on its own, even if nobody is signed in."
                />
              ) : (
                <ul className="grid gap-3">
                  {scheduled.map((post) => (
                    <PostCard key={post.id} post={post} businessName={active.name}>
                      <span className="flex flex-wrap justify-end gap-2">
                        <ActionButton action={publishPostNow.bind(null, post.id)} pendingLabel="Posting…">
                          Post now
                        </ActionButton>
                        <ActionButton
                          action={archivePost.bind(null, post.id)}
                          pendingLabel="Cancelling…"
                          variant="ghost"
                          aria-label={`Cancel the post scheduled for ${formatDateTime(post.publishAt)}`}
                          confirm={{ question: "Cancel this post?", yes: "Yes, cancel" }}
                        >
                          Cancel
                        </ActionButton>
                      </span>
                    </PostCard>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Live on your profile</CardTitle>
              <Badge tone="success">{live.length} live</Badge>
            </CardHeader>
            <CardContent>
              {live.length === 0 ? (
                <EmptyState
                  icon={Megaphone}
                  title="No posts yet"
                  description="Your first post introduces you to everyone who follows your business."
                />
              ) : (
                <ul className="grid gap-3">
                  {live.map((post) => (
                    <PostCard key={post.id} post={post} businessName={active.name}>
                      <ActionButton
                        action={archivePost.bind(null, post.id)}
                        pendingLabel="Removing…"
                        variant="ghost"
                        aria-label={`Take down the post from ${formatDateTime(post.publishAt)}`}
                        confirm={{ question: "Take this post down?", yes: "Yes, take down" }}
                      >
                        Take down
                      </ActionButton>
                    </PostCard>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
