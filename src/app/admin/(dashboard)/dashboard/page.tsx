import React from 'react';
import DashboardClient from './DashboardClient';
import { getDashboardDataAction } from '@/app/actions/dashboardActions';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return <DashboardClient initialData={undefined} />;
}
