'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductForm from '@/components/admin/products/ProductForm';
import { fetchProductById } from '@/services/productService';
import { updateProductDeepAction } from '@/app/actions/productActions';
import { FormSkeleton } from '@/components/admin/shared/AdminPageSkeletons';

export default function EditProductPage() {
    const params = useParams();
    const id = params.id as string;
    const [product, setProduct] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadProduct() {
            if (!id) return;
            setIsLoading(true);
            try {
                const data = await fetchProductById(id);
                setProduct(data);
            } catch (error) {
                console.error('Failed to load product:', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadProduct();
    }, [id]);

    if (isLoading) {
        return <FormSkeleton />;
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] gap-4 text-center p-6">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                </div>
                <h2 className="text-[#242424] text-[18px] font-semibold font-rubik">Product Not Found</h2>
                <p className="text-[#71717a] text-[14px] max-w-xs font-rubik">The product you are trying to edit doesn't exist or has been removed.</p>
            </div>
        );
    }

    return (
        <ProductForm 
            mode="edit"
            initialData={product}
            onSave={(data) => updateProductDeepAction(id, data)}
        />
    );
}
