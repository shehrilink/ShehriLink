"use client";

import Image from "next/image";
import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "./actions";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const [state, formAction, pending] = useActionState(signIn, null);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="ShehriLink"
            width={56}
            height={56}
            className="mx-auto mb-4 rounded-md"
          />
          <h1 className="font-display font-bold text-2xl text-teal-deep tracking-tight">
            ShehriLink
          </h1>
          <p className="text-sm text-stone mt-1">Municipal staff sign-in</p>
        </div>

        <form
          action={formAction}
          className="bg-paper-raised border border-border rounded-md p-6 space-y-4"
        >
          <input type="hidden" name="next" value={next} />

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border border-border-strong bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal-mid"
              placeholder="you@municipality.gov.pk"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-border-strong bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal-mid"
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-brick bg-brick/10 border border-brick/20 rounded-md px-3 py-2">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-teal-deep text-paper font-medium text-sm py-2.5 hover:bg-teal-mid transition-colors disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-xs text-stone mt-6">
          Accounts are provisioned by your supervisor. Contact your municipal IT desk for access.
        </p>
      </div>
    </div>
  );
}
