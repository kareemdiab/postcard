import Link from "next/link";
import { signUp } from "@/app/auth/actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="card w-full max-w-sm p-8">
        <h1 className="font-display text-3xl text-ink">Send your first card</h1>
        <p className="mt-1 text-sm text-ink/60">Create an account to get started.</p>

        {error && (
          <p className="mt-4 rounded-sm bg-red/10 px-3 py-2 text-sm text-red">{error}</p>
        )}

        <form action={signUp} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-ink/80">
            Username
            <input
              name="username"
              type="text"
              required
              pattern="[a-zA-Z0-9_]{3,20}"
              title="3-20 characters: letters, numbers, underscores"
              className="input"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink/80">
            Display name
            <input name="displayName" type="text" className="input" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink/80">
            Email
            <input name="email" type="email" required className="input" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink/80">
            Password
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="input"
            />
          </label>
          <button type="submit" className="btn-primary mt-2">
            Create account
          </button>
        </form>

        <p className="mt-6 text-sm text-ink/60">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-teal underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
