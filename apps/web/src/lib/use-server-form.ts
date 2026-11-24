"use client";

import { useCallback, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";

/** Show the saved data after a one-tap Server Action by refreshing the page's server-rendered data in place. */
export function useRefreshAfterAction(): () => void {
  const router = useRouter();
  return useCallback(() => router.refresh(), [router]);
}

interface ServerFormOptions<S> {
  /** When the page's data needs refreshing. By default, after a successful save. */
  shouldRefresh?: (state: S) => boolean;
}

/**
 * Posts a form to a Server Action and then refreshes the page's server-rendered data in place.
 * Same shape as React's `useActionState`.
 *
 * In-place refreshes used to hang in this app. The cause was a route-level `loading.tsx` in the
 * suite: with it present, a refresh or a change of search parameters on a page that reads
 * `searchParams` never finished applying. Do not add one back without re-running the navigation
 * checks; show loading feedback another way (see the pending marker in SuiteNav).
 */
export function useServerForm<S extends { status: string }>(
  action: (prev: S, formData: FormData) => Promise<S>,
  initial: S,
  options: ServerFormOptions<S> = {},
): [S, (formData: FormData) => void, boolean] {
  const { shouldRefresh = (next: S) => next.status === "success" } = options;
  const router = useRouter();
  const [state, setState] = useState(initial);
  const [pending, startTransition] = useTransition();
  const formAction = useCallback(
    (formData: FormData) => {
      startTransition(async () => {
        const next = await action(state, formData);
        setState(next);
        if (shouldRefresh(next)) router.refresh();
      });
    },
    [action, router, shouldRefresh, state],
  );
  return [state, formAction, pending];
}

/**
 * Submit handler for a form that uses `useServerForm`. Passing the action to the form's `action`
 * prop makes React clear every field once the action returns, including when it returned a
 * validation error, so one mistake wiped everything the person had typed. Submitting this way
 * leaves the fields alone; forms clear themselves only after a successful save.
 */
export function submitWith(formAction: (formData: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    formAction(new FormData(event.currentTarget));
  };
}
