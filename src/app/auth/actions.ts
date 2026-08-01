"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/feed");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const username = (formData.get("username") as string)?.trim().toLowerCase();
  const displayName = (formData.get("displayName") as string)?.trim();

  if (!/^[a-z0-9_]{3,20}$/.test(username ?? "")) {
    redirect(
      "/signup?error=" +
        encodeURIComponent("Username must be 3-20 characters: letters, numbers, underscores")
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username, display_name: displayName || username } },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?message=" + encodeURIComponent("Check your email to confirm your account"));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
