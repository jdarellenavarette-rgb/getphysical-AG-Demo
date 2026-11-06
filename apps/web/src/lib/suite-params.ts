import { notFound } from 'next/navigation';
import { SUITE_LABELS, TAB_LABELS, parseSuiteSlug, type NavTab, type SuiteMode } from './suite-routes';

export type SuiteParams = Promise<{ suite: string }>;

/** Resolves and validates the [suite] segment inside a Server Component. */
export async function resolveSuite(params: SuiteParams): Promise<SuiteMode> {
  const { suite } = await params;
  const mode = parseSuiteSlug(suite);
  if (!mode) notFound();
  return mode;
}

export async function suiteTabTitle(params: SuiteParams, tab: NavTab): Promise<string> {
  const { suite } = await params;
  const mode = parseSuiteSlug(suite);
  return mode ? `${TAB_LABELS[tab]} · ${SUITE_LABELS[mode]}` : TAB_LABELS[tab];
}
