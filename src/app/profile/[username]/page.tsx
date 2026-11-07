import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostcardCard } from "@/components/PostcardCard";

type ProfilePostcard = {
  id: string;
  image_url: string;
  message: string;
  created_at: string;
  stamp_id: string | null;
};

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const { data } = await supabase
    .from("postcards")
    .select("id, image_url, message, created_at, stamp_id")
    .eq("sender_id", profile.id)
    .neq("visibility", "direct")
    .order("created_at", { ascending: false });

  const postcards = (data ?? []) as ProfilePostcard[];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl text-ink">
        {profile.display_name || profile.username}
      </h1>
      <p className="mt-1 text-sm text-ink/60">@{profile.username}</p>

      {postcards.length === 0 ? (
        <p className="mt-10 text-sm text-ink/60">No postcards to show.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {postcards.map((postcard) => (
            <PostcardCard
              key={postcard.id}
              imageUrl={postcard.image_url}
              message={postcard.message}
              createdAt={postcard.created_at}
              senderLabel={profile.username}
              stampId={postcard.stamp_id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
