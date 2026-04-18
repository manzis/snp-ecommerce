import React from 'react';
import { fetchProducts, fetchCategories, fetchBrands } from '@/services/productService';
import ClientProductsLayout from './ClientProductsLayout';

export default async function ProductsPage() {
    // Execute all heavy database fetches concurrently on the edge server instantly
    const [products, brands, categories] = await Promise.all([
        fetchProducts(),
        fetchBrands(),
        fetchCategories()
    ]);

    // Pass the strictly resolved cache payload directly into the client framework
    // Eliminates all loading spinners and prevents layout shift delays
    return (
        <ClientProductsLayout 
            initialProducts={products}
            brandsData={brands}
            categoriesData={categories}
        />
    );
}
