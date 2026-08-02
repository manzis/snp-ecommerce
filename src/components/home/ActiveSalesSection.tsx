import React from 'react';
import { fetchActiveSalesAction } from '@/app/actions/saleActions';
import ActiveSalesSlider from './ActiveSalesSlider';

export default async function ActiveSalesSection() {
    const { success, data: activeSales } = await fetchActiveSalesAction();

    if (!success || !activeSales || activeSales.length === 0) {
        return null;
    }

    return <ActiveSalesSlider sales={activeSales} />;
}
