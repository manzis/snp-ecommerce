'use client';

import ProductForm from '@/components/admin/products/ProductForm';
import { createProductAction } from '@/app/actions/productActions';

const STORAGE_KEY = 'snp_store_add_product_v1';

export default function AddProductPage() {
    return (
        <ProductForm 
            mode="create"
            onSave={createProductAction}
            storageKey={STORAGE_KEY}
        />
    );
}
