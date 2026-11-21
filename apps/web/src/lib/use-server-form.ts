"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reloadKeepingPlace, takeFlash } from "./reload";

/** Show the saved data after a one-tap Server Action: reloads the page and keeps the scroll position. */
export function useRefreshAfterAction(): () => void {
  return useCallback(() => reloadKeepingPlace(), []);
}

interface ServerFormOptions<S> {
  /**
   * Names this form on its page. With it, a successful save reloads the page (see lib/reload) and
   * the result is shown again afterwards. Without it the page is refreshed in place, best effort:
   * for forms whose result must stay on screen, such as a scan verdict.
   */
  id?: string;
  /** When the page's data needs reloading. By default, after a successful save. */
  shouldRefresh?: (state: S) => boolean;
}

/**
 * Posts a form to a Server Action and then shows the saved data.
 * Same shape as React's `useActionState`, which the suite used before.
 */
export function useServerForm<S extends { status: string }>(
  action: (prev: S, formData: FormData) => Promise<S>,
  initial: S,
  options: ServerFormOptions<S> = {},
): [S, (formData: FormData) => void, boolean] {
  const { id, shouldRefresh = (next: S) => next.status === "success" } = options;
  const router = useRouter();
  const [state, setState] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [reloading, setReloading] = useState(false);

  // After the reload, show the result of the save that caused it.
  useEffect(() => {
    if (!id) return;
    const saved = takeFlash<S>(id);
    if (saved) setState(saved);
  }, [id]);

  const formAction = useCallback(
    (formData: FormData) => {
      startTransition(async () => {
        const next = await action(state, formData);
        if (!shouldRefresh(next)) {
          setState(next);
        } else if (id) {
          // Keep the button disabled until the fresh page replaces this one.
          setReloading(true);
          reloadKeepingPlace({ key: id, state: next });
        } else {
          setState(next);
          setTimeout(() => router.refresh(), 0);
        }
      });
    },
    [action, id, router, shouldRefresh, state],
  );
  return [state, formAction, pending || reloading];
}
