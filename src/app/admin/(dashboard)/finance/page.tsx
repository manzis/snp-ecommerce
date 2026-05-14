import FinanceClient from './FinanceClient';
import { fetchFinanceDashboardDataAction } from '@/app/actions/financeActions';

export default async function FinancePage() {
    const end = new Date().toISOString().split('T')[0];
    const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const result = await fetchFinanceDashboardDataAction(start, end);
    const initialData = result.success ? result.data : undefined;
    return <FinanceClient initialData={initialData} serverDateRange={{ start, end }} />;
}
