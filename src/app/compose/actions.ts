"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { STAMPS, DEFAULT_STAMP_ID } from "@/components/Stamp";

export async function createPostcard(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const image = formData.get("image") as File | null;
  const message = (formData.get("message") as string)?.trim();
  const visibility = formData.get("visibility") as "public" | "friends" | "direct";
  const recipientUsername = (formData.get("recipient") as string)?.trim().toLowerCase();
  const requestedStampId = formData.get("stamp_id") as string;
  const stampId = STAMPS.some((s) => s.id === requestedStampId)
    ? requestedStampId
    : DEFAULT_STAMP_ID;

  if (!image || image.size === 0 || !message) {
    redirect("/compose?error=" + encodeURIComponent("Add a photo and a message"));
  }

  if (visibility === "direct" && !recipientUsername) {
    redirect("/compose?error=" + encodeURIComponent("Pick a friend to send this to"));
  }

  let recipientId: string | null = null;
  if (visibility === "direct") {
    const { data: recipient } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", recipientUsername)
      .single();

    if (!recipient) {
      redirect("/compose?error=" + encodeURIComponent("Couldn't find that friend's username"));
    }
    recipientId = recipient!.id;
  }

  const ext = image.name.split(".").pop() || "jpg";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("postcard-images")
    .upload(path, image, { contentType: image.type });

  if (uploadError) {
    redirect("/compose?error=" + encodeURIComponent(uploadError.message));
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("postcard-images").getPublicUrl(path);

  const { data: postcard, error: postcardError } = await supabase
    .from("postcards")
    .insert({ sender_id: user.id, image_url: publicUrl, message, visibility, stamp_id: stampId })
    .select("id")
    .single();

  if (postcardError || !postcard) {
    redirect(
      "/compose?error=" + encodeURIComponent(postcardError?.message ?? "Something went wrong")
    );
  }

  if (visibility === "direct" && recipientId) {
    await supabase
      .from("postcard_recipients")
      .insert({ postcard_id: postcard!.id, recipient_id: recipientId });
  }

  redirect(visibility === "direct" ? "/mailbox" : "/feed");
}
