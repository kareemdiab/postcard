import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PostcardCard } from "@/components/PostcardCard";

type FeedPostcard = {
  id: string;
  image_url: string;
  message: string;
  created_at: string;
  profiles: { username: string } | null;
};

export default async function FeedPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("postcards")
    .select("id, image_url, message, created_at, profiles!postcards_sender_id_fkey(username)")
    .neq("visibility", "direct")
    .order("created_at", { ascending: false })
    .limit(50);

  const postcards = (data ?? []) as unknown as FeedPostcard[];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl text-ink">The Feed</h1>
      <p className="mt-1 text-sm text-ink/60">Postcards from everyone and your friends.</p>

      {postcards.length === 0 ? (
        <p className="mt-10 text-sm text-ink/60">
          No postcards yet.{" "}
          <Link href="/compose" className="text-teal underline">
            Send the first one
          </Link>
          .
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {postcards.map((postcard) => (
            <PostcardCard
              key={postcard.id}
              imageUrl={postcard.image_url}
              message={postcard.message}
              createdAt={postcard.created_at}
              senderLabel={postcard.profiles?.username ?? "unknown"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
