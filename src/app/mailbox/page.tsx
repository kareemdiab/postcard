import { createClient } from "@/lib/supabase/server";
import { PostcardCard } from "@/components/PostcardCard";
import { redirect } from "next/navigation";

type MailRow = {
  read_at: string | null;
  postcards: {
    id: string;
    image_url: string;
    message: string;
    created_at: string;
    profiles: { username: string } | null;
  } | null;
};

export default async function MailboxPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("postcard_recipients")
    .select(
      "read_at, postcards(id, image_url, message, created_at, profiles!postcards_sender_id_fkey(username))"
    )
    .eq("recipient_id", user.id);

  const mail = ((data ?? []) as unknown as MailRow[])
    .filter((row) => row.postcards)
    .sort(
      (a, b) =>
        new Date(b.postcards!.created_at).getTime() -
        new Date(a.postcards!.created_at).getTime()
    );

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl text-ink">Mailbox</h1>
      <p className="mt-1 text-sm text-ink/60">Postcards sent just to you.</p>

      {mail.length === 0 ? (
        <p className="mt-10 text-sm text-ink/60">Nothing in your mailbox yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {mail.map((row) => (
            <PostcardCard
              key={row.postcards!.id}
              imageUrl={row.postcards!.image_url}
              message={row.postcards!.message}
              createdAt={row.postcards!.created_at}
              senderLabel={row.postcards!.profiles?.username ?? "unknown"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
