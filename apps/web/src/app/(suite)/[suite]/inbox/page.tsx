import React from 'react';
import type { Metadata } from 'next';
import { resolveSuite, suiteTabTitle, type SuiteParams } from '../../../../lib/suite-params';
import { PAGE_COPY } from '../../../../lib/suite-copy';
import { PageHeader } from '../../../../components/shell/PageHeader';
import { AthleticInboxCRMView } from '../../../../components/suite/AthleticInboxCRMView';
import { INITIAL_TICKETS, mergeStoredReplies } from '../../../../components/crm/seed';
import { listReplies } from '../../../../lib/crm-server';

/** Reads the live reply store on every request so mobile replies sent over HTTP appear on load. */
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: SuiteParams }): Promise<Metadata> {
  return { title: await suiteTabTitle(params, 'INBOX') };
}

export default async function InboxPage({ params }: { params: SuiteParams }) {
  const suiteMode = await resolveSuite(params);
  const copy = PAGE_COPY.INBOX[suiteMode];
  const tickets = mergeStoredReplies(INITIAL_TICKETS, listReplies());
  return (
    <>
      <PageHeader title={copy.title} subtitle={copy.subtitle} />
      <AthleticInboxCRMView suiteMode={suiteMode} initialTickets={tickets} />
    </>
  );
}
