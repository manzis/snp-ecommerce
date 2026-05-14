import React from 'react';
import DashboardClient from './DashboardClient';
import { getDashboardDataAction } from '@/app/actions/dashboardActions';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const result = await getDashboardDataAction();
  const initialData = result.success ? result.data : undefined;
  
  return <DashboardClient initialData={initialData} />;
}
