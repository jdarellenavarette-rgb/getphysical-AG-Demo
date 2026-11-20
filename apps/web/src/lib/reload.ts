/**
 * Reloading the page after a save, without losing your place.
 *
 * The suite's pages are rendered on the server, so after a Server Action changes data the page has
 * to be fetched again. Updating it in place (`router.refresh()`, or `revalidatePath` in the action)
 * proved unreliable here: the update sometimes never finished applying, which left the old data on
 * screen and the submit button stuck. A full reload always shows the saved data, so saves use that,
 * and these helpers carry the scroll position and the success message across it.
 */
const SCROLL_KEY = "gp_scroll";
const FLASH_KEY = "gp_flash";
/** The element that scrolls on desktop; on phones the window scrolls. */
export const SUITE_SCROLLER_ID = "suite-scroll";

function storage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/** Reload the page, keeping the scroll position and optionally a result to show afterwards. */
export function reloadKeepingPlace(flash?: { key: string; state: unknown }): void {
  const store = storage();
  if (store) {
    const scroller = document.getElementById(SUITE_SCROLLER_ID);
    store.setItem(
      SCROLL_KEY,
      JSON.stringify({ path: window.location.pathname, inner: scroller?.scrollTop ?? 0, page: window.scrollY }),
    );
    if (flash) store.setItem(FLASH_KEY, JSON.stringify({ ...flash, path: window.location.pathname }));
  }
  window.location.reload();
}

/**
 * Put the page back where it was before the reload. Called once when the shell mounts.
 * The page content streams in after the shell, so the position is applied as soon as the page is
 * tall enough to scroll that far, and given up on after a few seconds.
 */
export function restoreScroll(): void {
  const store = storage();
  const raw = store?.getItem(SCROLL_KEY);
  if (!store || !raw) return;
  store.removeItem(SCROLL_KEY);
  let saved: { path: string; inner: number; page: number };
  try {
    saved = JSON.parse(raw) as typeof saved;
  } catch {
    return;
  }
  if (saved.path !== window.location.pathname || (saved.inner <= 0 && saved.page <= 0)) return;

  // Follow the content as it arrives, stopping once the saved position is reachable, after a few
  // seconds (the page may now be shorter than it was), or as soon as the person scrolls themselves.
  const deadline = Date.now() + 3000;
  let cancelled = false;
  const cancel = () => {
    cancelled = true;
  };
  const events = ["wheel", "touchstart", "keydown", "mousedown"] as const;
  events.forEach((name) => window.addEventListener(name, cancel, { once: true, passive: true }));
  const apply = () => {
    if (cancelled) return;
    const scroller = document.getElementById(SUITE_SCROLLER_ID);
    const innerRoom = Math.max(scroller ? scroller.scrollHeight - scroller.clientHeight : 0, 0);
    const pageRoom = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
    if (scroller) scroller.scrollTop = Math.min(saved.inner, innerRoom);
    if (saved.page > 0) window.scrollTo(0, Math.min(saved.page, pageRoom));
    if ((innerRoom >= saved.inner && pageRoom >= saved.page) || Date.now() > deadline) {
      events.forEach((name) => window.removeEventListener(name, cancel));
      return;
    }
    requestAnimationFrame(apply);
  };
  requestAnimationFrame(apply);
}

/** The result a form saved just before the reload, if it was this form on this page. Read once. */
export function takeFlash<S>(key: string): S | null {
  const store = storage();
  const raw = store?.getItem(FLASH_KEY);
  if (!store || !raw) return null;
  try {
    const saved = JSON.parse(raw) as { key: string; path: string; state: S };
    if (saved.key !== key || saved.path !== window.location.pathname) return null;
    store.removeItem(FLASH_KEY);
    return saved.state;
  } catch {
    store.removeItem(FLASH_KEY);
    return null;
  }
}
