import Link from "next/link";
import { signIn } from "@/app/auth/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="card w-full max-w-sm p-8">
        <h1 className="font-display text-3xl text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-ink/60">Sign in to check your mailbox.</p>

        {message && (
          <p className="mt-4 rounded-sm bg-teal/10 px-3 py-2 text-sm text-teal">{message}</p>
        )}
        {error && (
          <p className="mt-4 rounded-sm bg-red/10 px-3 py-2 text-sm text-red">{error}</p>
        )}

        <form action={signIn} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-ink/80">
            Email
            <input name="email" type="email" required className="input" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink/80">
            Password
            <input name="password" type="password" required className="input" />
          </label>
          <button type="submit" className="btn-primary mt-2">
            Sign in
          </button>
        </form>

        <p className="mt-6 text-sm text-ink/60">
          New here?{" "}
          <Link href="/signup" className="font-medium text-teal underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
