import { createClient } from "@/lib/supabase/server";
import { getAcceptedFriends } from "@/lib/friends";
import { createPostcard } from "./actions";

export default async function ComposePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const friends = user ? await getAcceptedFriends(supabase, user.id) : [];

  return (
    <div className="flex flex-1 justify-center px-4 py-12">
      <div className="card w-full max-w-lg p-8">
        <h1 className="font-display text-3xl text-ink">Write a postcard</h1>
        <p className="mt-1 text-sm text-ink/60">
          Pick a photo for the front, write a note on the back.
        </p>

        {error && (
          <p className="mt-4 rounded-sm bg-red/10 px-3 py-2 text-sm text-red">{error}</p>
        )}

        <form action={createPostcard} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-ink/80">
            Photo
            <input
              name="image"
              type="file"
              accept="image/*"
              required
              className="input file:mr-3 file:rounded-sm file:border-0 file:bg-ink file:px-3 file:py-1.5 file:font-type file:text-xs file:uppercase file:text-cream"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-ink/80">
            Message
            <textarea
              name="message"
              required
              rows={4}
              maxLength={500}
              className="input font-script text-lg"
              placeholder="Wish you were here..."
            />
          </label>

          <fieldset className="flex flex-col gap-2 text-sm text-ink/80">
            <legend className="mb-1">Who&rsquo;s it for?</legend>
            <label className="flex items-center gap-2">
              <input type="radio" name="visibility" value="public" defaultChecked />
              Everyone (public feed)
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="visibility" value="friends" />
              Friends only
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="visibility" value="direct" />
              One friend&rsquo;s mailbox
            </label>
          </fieldset>

          <label className="flex flex-col gap-1 text-sm text-ink/80">
            Recipient (only needed for &ldquo;one friend&rsquo;s mailbox&rdquo;)
            <select name="recipient" className="input">
              <option value="">Select a friend</option>
              {friends.map((friend) => (
                <option key={friend.id} value={friend.username}>
                  {friend.display_name || friend.username}
                </option>
              ))}
            </select>
            {friends.length === 0 && (
              <span className="text-xs text-ink/50">
                You don&rsquo;t have any friends yet — add some on the Friends page.
              </span>
            )}
          </label>

          <button type="submit" className="btn-primary mt-2">
            Send postcard
          </button>
        </form>
      </div>
    </div>
  );
}
