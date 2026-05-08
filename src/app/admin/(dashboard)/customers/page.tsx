import CustomersClient from './CustomersClient';

export const metadata = {
    title: 'Customer Management | SNP Admin',
    description: 'Manage customers, analyze behavior, and track loyalty metrics.',
};

export default function CustomersPage() {
    return <CustomersClient />;
}
