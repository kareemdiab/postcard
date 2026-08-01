"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function sendFriendRequest(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const username = (formData.get("username") as string)?.trim().toLowerCase();
  if (!username) {
    redirect("/friends?error=" + encodeURIComponent("Enter a username"));
  }

  const { data: target } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single();

  if (!target) {
    redirect("/friends?error=" + encodeURIComponent("Couldn't find that username"));
  }
  if (target!.id === user.id) {
    redirect("/friends?error=" + encodeURIComponent("That's you!"));
  }

  const { error } = await supabase
    .from("friendships")
    .insert({ requester_id: user.id, addressee_id: target!.id });

  if (error) {
    redirect(
      "/friends?error=" +
        encodeURIComponent(
          error.code === "23505" ? "You've already sent a request to this person" : error.message
        )
    );
  }

  revalidatePath("/friends");
  redirect("/friends");
}

export async function acceptFriendRequest(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("id", id);

  if (error) {
    redirect("/friends?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/friends");
  redirect("/friends");
}
