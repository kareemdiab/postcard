import type { SupabaseClient } from "@supabase/supabase-js";

export type FriendProfile = {
  id: string;
  username: string;
  display_name: string | null;
};

export async function getAcceptedFriends(
  supabase: SupabaseClient,
  userId: string
): Promise<FriendProfile[]> {
  const { data: rows } = await supabase
    .from("friendships")
    .select("requester_id, addressee_id")
    .eq("status", "accepted")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

  const friendIds = (rows ?? []).map((r) =>
    r.requester_id === userId ? r.addressee_id : r.requester_id
  );
  if (friendIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .in("id", friendIds);

  return profiles ?? [];
}
