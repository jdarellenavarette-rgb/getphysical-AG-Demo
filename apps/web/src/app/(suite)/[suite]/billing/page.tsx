import React from 'react';
import type { Metadata } from 'next';
import { resolveSuite, suiteTabTitle, type SuiteParams } from '../../../../lib/suite-params';
import { PAGE_COPY } from '../../../../lib/suite-copy';
import { PageHeader } from '../../../../components/shell/PageHeader';
import { DailyDash } from '../../../../components/daily-dash/DailyDash';

export async function generateMetadata({ params }: { params: SuiteParams }): Promise<Metadata> {
  return { title: await suiteTabTitle(params, 'BILLING') };
}

export default async function BillingPage({ params }: { params: SuiteParams }) {
  const suiteMode = await resolveSuite(params);
  const copy = PAGE_COPY.BILLING[suiteMode];
  return (
    <>
      <PageHeader title={copy.title} subtitle={copy.subtitle} />
      <DailyDash />
    </>
  );
}
