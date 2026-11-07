import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostcardCard } from "@/components/PostcardCard";

type PostcardDetail = {
  id: string;
  image_url: string;
  message: string;
  created_at: string;
  stamp_id: string | null;
  profiles: { username: string } | null;
};

export default async function PostcardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("postcards")
    .select(
      "id, image_url, message, created_at, stamp_id, profiles!postcards_sender_id_fkey(username)"
    )
    .eq("id", id)
    .single();

  if (!data) notFound();

  const postcard = data as unknown as PostcardDetail;

  await supabase
    .from("postcard_recipients")
    .update({ read_at: new Date().toISOString() })
    .eq("postcard_id", id)
    .eq("recipient_id", user.id)
    .is("read_at", null);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-10">
      <PostcardCard
        imageUrl={postcard.image_url}
        message={postcard.message}
        createdAt={postcard.created_at}
        senderLabel={postcard.profiles?.username ?? "unknown"}
        stampId={postcard.stamp_id}
      />
      <p className="mt-4 text-xs text-ink/50">Tap the card to flip it over.</p>
    </div>
  );
}
