import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  return (
    <nav className="border-b-2 border-stamp/30 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/feed" className="font-display text-xl text-ink">
          Postmark
        </Link>
        <div className="flex flex-wrap items-center gap-4 font-type text-xs uppercase tracking-wide text-ink/70">
          <Link href="/feed" className="hover:text-teal">
            Feed
          </Link>
          <Link href="/mailbox" className="hover:text-teal">
            Mailbox
          </Link>
          <Link href="/compose" className="hover:text-teal">
            Compose
          </Link>
          <Link href="/friends" className="hover:text-teal">
            Friends
          </Link>
          {profile?.username && (
            <Link href={`/profile/${profile.username}`} className="hover:text-teal">
              Profile
            </Link>
          )}
          <form action={signOut}>
            <button type="submit" className="hover:text-red">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
