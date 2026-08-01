import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendFriendRequest, acceptFriendRequest } from "./actions";

type IncomingRequest = {
  id: string;
  profiles: { username: string; display_name: string | null } | null;
};

type OutgoingRequest = {
  id: string;
  profiles: { username: string; display_name: string | null } | null;
};

export default async function FriendsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: incomingData } = await supabase
    .from("friendships")
    .select("id, profiles!friendships_requester_id_fkey(username, display_name)")
    .eq("addressee_id", user.id)
    .eq("status", "pending");

  const { data: outgoingData } = await supabase
    .from("friendships")
    .select("id, profiles!friendships_addressee_id_fkey(username, display_name)")
    .eq("requester_id", user.id)
    .eq("status", "pending");

  const { data: acceptedData } = await supabase
    .from("friendships")
    .select(
      "id, requester_id, addressee_id, requester:profiles!friendships_requester_id_fkey(username, display_name), addressee:profiles!friendships_addressee_id_fkey(username, display_name)"
    )
    .eq("status", "accepted")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

  const incoming = (incomingData ?? []) as unknown as IncomingRequest[];
  const outgoing = (outgoingData ?? []) as unknown as OutgoingRequest[];

  type AcceptedRow = {
    id: string;
    requester_id: string;
    addressee_id: string;
    requester: { username: string; display_name: string | null } | null;
    addressee: { username: string; display_name: string | null } | null;
  };

  const accepted = ((acceptedData ?? []) as unknown as AcceptedRow[]).map((row) =>
    row.requester_id === user.id ? row.addressee : row.requester
  );

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="font-display text-3xl text-ink">Friends</h1>
      <p className="mt-1 text-sm text-ink/60">
        Add friends by username to send them postcards directly.
      </p>

      {error && (
        <p className="mt-4 rounded-sm bg-red/10 px-3 py-2 text-sm text-red">{error}</p>
      )}

      <form action={sendFriendRequest} className="mt-6 flex gap-2">
        <input
          name="username"
          type="text"
          required
          placeholder="username"
          className="input flex-1"
        />
        <button type="submit" className="btn-primary">
          Add friend
        </button>
      </form>

      {incoming.length > 0 && (
        <section className="mt-10">
          <h2 className="font-type text-xs uppercase tracking-wide text-ink/70">
            Requests waiting on you
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {incoming.map((req) => (
              <li
                key={req.id}
                className="card flex items-center justify-between px-4 py-3"
              >
                <span className="text-sm text-ink">
                  {req.profiles?.display_name || req.profiles?.username}
                </span>
                <form action={acceptFriendRequest}>
                  <input type="hidden" name="id" value={req.id} />
                  <button type="submit" className="btn-secondary">
                    Accept
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}

      {outgoing.length > 0 && (
        <section className="mt-10">
          <h2 className="font-type text-xs uppercase tracking-wide text-ink/70">
            Requests you sent
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {outgoing.map((req) => (
              <li key={req.id} className="card px-4 py-3 text-sm text-ink/70">
                {req.profiles?.display_name || req.profiles?.username} — pending
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-type text-xs uppercase tracking-wide text-ink/70">
          Your friends
        </h2>
        {accepted.length === 0 ? (
          <p className="mt-3 text-sm text-ink/60">No friends yet.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {accepted.map((friend, i) => (
              <li key={i} className="card px-4 py-3 text-sm text-ink">
                {friend?.display_name || friend?.username}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
