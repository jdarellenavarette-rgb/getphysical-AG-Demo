import React from 'react';
import type { Metadata } from 'next';
import { resolveSuite, suiteTabTitle, type SuiteParams } from '../../../../lib/suite-params';
import { PAGE_COPY } from '../../../../lib/suite-copy';
import { PageHeader } from '../../../../components/shell/PageHeader';
import { SpatialCalendar } from '../../../../components/clubdash/SpatialCalendar';

export async function generateMetadata({ params }: { params: SuiteParams }): Promise<Metadata> {
  return { title: await suiteTabTitle(params, 'SPATIAL') };
}

export default async function SpatialPage({ params }: { params: SuiteParams }) {
  const suiteMode = await resolveSuite(params);
  const copy = PAGE_COPY.SPATIAL[suiteMode];
  return (
    <>
      <PageHeader title={copy.title} subtitle={copy.subtitle} />
      <SpatialCalendar />
    </>
  );
}
