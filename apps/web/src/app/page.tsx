import { redirect } from 'next/navigation';
import { DEFAULT_SUITE, DEFAULT_TAB, suiteHref } from '../lib/suite-routes';

export default function RootPage() {
  redirect(suiteHref(DEFAULT_SUITE, DEFAULT_TAB));
}
