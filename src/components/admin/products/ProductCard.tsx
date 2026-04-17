'use client';

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductActionMenu from "./ProductActionMenu";
import UpdatePriceModal from "./UpdatePriceModal";
import { Product } from "@/services/productService";
import { updateProductAction, deleteProductAction, duplicateProductAction } from "@/app/actions/productActions";
import { useAdminToast } from "@/components/admin/ui/AdminToastProvider";

interface DashboardProductCardProps {
    id?: string;
    image?: string;
    status?: string;
    brand?: string;
    title?: string;
    originalPrice?: string;
    currentPrice?: string;
    sizes?: string[];
    flavors?: string[];
    stockCount?: number;
    fullProduct?: Product;
}

export default function DashboardProductCard({
    id = "1",
    image = "/images/product-placeholder.png",
    status = "Published",
    brand = "ASITIS-NUTRITION",
    title = "Creatine Monohydrate and",
    originalPrice = "NPR 4500",
    currentPrice = "NPR 4500",
    sizes = ["1Kg", "2kg"],
    flavors = ["Chocolate", "Double Rich Chocolate"],
    stockCount = 100,
    fullProduct,
}: DashboardProductCardProps) {
    const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
    const [localProduct, setLocalProduct] = useState<Product | undefined>(fullProduct);
    const { showAdminToast } = useAdminToast();

    // Sync local state if prop changes (e.g. from parent refresh)
    React.useEffect(() => {
        setLocalProduct(fullProduct);
    }, [fullProduct]);

    const handleUpdate = async (updates: Partial<Product>) => {
        const res = await updateProductAction(id, updates);
        if (res.success) {
            // Update local state to reflect changes instantly
            if (localProduct) {
                setLocalProduct({
                    ...localProduct,
                    ...updates
                });
            }
            let message = 'Product updated successfully.';
            if (updates.is_published !== undefined) {
                message = updates.is_published ? 'Product published live.' : 'Product hidden from store.';
            } else if (updates.is_draft !== undefined) {
                message = updates.is_draft ? 'Product moved to drafts.' : 'Product removed from drafts.';
            } else if (updates.stock_status !== undefined) {
                message = `Stock status updated to ${updates.stock_status.replace(/_/g, ' ')}.`;
            }
            showAdminToast(message, 'success');
        } else {
            showAdminToast(`Failed to update product: ${res.message}`, 'error');
        }
    };

    const handleDelete = async () => {
        if (confirm(`Are you sure you want to delete ${title}?`)) {
            const res = await deleteProductAction(id);
            if (res.success) {
                showAdminToast('Product deleted successfully.', 'success');
                setTimeout(() => window.location.reload(), 1000);
            } else {
                showAdminToast(res.message, 'error');
            }
        }
    };

    const handleDuplicate = async () => {
        const res = await duplicateProductAction(id);
        if (res.success) {
            showAdminToast('Product duplicated successfully.', 'success');
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showAdminToast(res.message, 'error');
        }
    };

    return (
        <article className={`flex w-full max-w-[378px] mx-auto flex-col p-[12px] gap-[12px] justify-end items-start bg-white rounded-[12px] relative group transition-all duration-[500ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] font-rubik tracking-tight shadow-[0_4px_20px_-1px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_-4px_rgba(0,0,0,0.06)] hover:-translate-y-[2px] border border-gray-50/50 ${isActionMenuOpen ? 'z-[60]' : 'z-[1]'}`}>
            <Link href={`/admin/products/preview/${localProduct?.slug || id}`} className="flex min-w-[0px] flex-col gap-[16px] items-start self-stretch shrink-0 relative cursor-pointer">

                {/* --- Top Section: Image & Main Details --- */}
                <div className="flex gap-[12px] items-stretch self-stretch shrink-0 relative z-[1]">

                    {/* Image Container */}
                    <div className="w-[104px] shrink-0 rounded-[8px] relative z-[2] overflow-hidden bg-[#f4f4f5] ">
                        <Image
                            src={image}
                            alt={title || 'Product'}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="104px"
                        />
                    </div>

                    {/* Details Section */}
                    <div className="flex flex-col gap-[8px] justify-center items-start self-stretch grow shrink-0 basis-[0px] relative z-[3] pr-[32px]">

                        {/* Status Badges */}
                        <div className="flex gap-[6px] items-center relative z-[4]">
                            {/* Visibility Badge */}
                            <div className={`flex px-[8px] py-[3px] justify-center items-center rounded-full border-[1px] transition-colors ${!localProduct?.is_published || localProduct?.is_draft ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-[linear-gradient(56.09deg,#242424,#8a8a8a)] border-[#e4e4e7] text-white'}`}>
                                <span className="text-[11px] font-medium uppercase tracking-tight">
                                    {localProduct?.is_draft ? 'Draft' : localProduct?.is_published ? 'Live' : 'Hidden'}
                                </span>
                            </div>

                            {/* Inventory Badge */}
                            <div className={`flex px-[8px] py-[3px] justify-center items-center rounded-full border-[1px] transition-colors ${localProduct?.stock_status === 'out_of_stock'
                                ? 'bg-red-50 border-red-100 text-red-600'
                                : localProduct?.stock_status === 'pre_order'
                                    ? 'bg-amber-50 border-amber-100 text-amber-700'
                                    : 'bg-green-50 border-green-100 text-green-700'
                                }`}>
                                <span className="text-[11px] font-medium uppercase tracking-tight">
                                    {localProduct?.stock_status === 'in_stock' ? 'In Stock' : localProduct?.stock_status === 'pre_order' ? 'Pre-Order' : 'Out of Stock'}
                                </span>
                            </div>
                        </div>

                        {/* Title & Brand */}
                        <div className="flex flex-col gap-[4px] items-start self-stretch shrink-0 relative z-[6]">
                            <span className="self-stretch shrink-0 text-[12px] md:text-[11px] font-regular text-[#71717a] whitespace-nowrap overflow-hidden text-ellipsis relative z-[7]">
                                {brand}
                            </span>
                            <h3 className="self-stretch shrink-0 text-[14px] md:text-[13px] font-medium leading-[19px] text-[#3f3f46] line-clamp-2 overflow-hidden break-words h-[38px] relative z-[8]">
                                {title}
                            </h3>
                        </div>

                        {/* Pricing */}
                        <div className="flex gap-[8px] items-center self-stretch shrink-0 relative z-[9]">
                            {/* Strictly use the base pricing established in the Products table */}
                            <>
                                {((localProduct?.original_price && Number(localProduct.original_price) > Number(localProduct?.discounted_price || 0)) || (originalPrice && originalPrice !== currentPrice)) && (
                                    <span className="text-[13px] md:text-[12px] font-regular text-[#71717a] line-through whitespace-nowrap relative z-[10]">
                                        {localProduct?.original_price ? `NPR ${localProduct.original_price}` : originalPrice}
                                    </span>
                                )}
                                <span className="text-[15px] md:text-[14px] font-semibold text-[#242424] whitespace-nowrap relative z-[11]">
                                    {localProduct?.discounted_price ? `NPR ${localProduct.discounted_price}` : currentPrice}
                                </span>
                            </>
                        </div>
                    </div>
                </div>

                {/* --- Bottom Section: Variations & Stock Table --- */}
                <div className="flex h-[83px] items-start self-stretch shrink-0 rounded-[8px] border-[1px] border-[#f3f4f6] relative z-[15] overflow-hidden bg-white">
                    {/* Sizes */}
                    <div className="flex w-[70px] px-[10px] py-[10px] flex-col gap-[6px] items-start self-stretch shrink-0 border-r-[1px] border-[#f3f4f6] relative z-[16]">
                        <div className="self-stretch shrink-0 text-[11px] font-regular whitespace-nowrap relative z-[17]">
                            <span className="text-[#a1a1aa] uppercase tracking-wider">Sizes</span>
                        </div>
                        <span className="self-stretch shrink-0 text-[13px] md:text-[12px] font-medium text-[#242424] whitespace-nowrap overflow-hidden text-ellipsis relative z-[18]">
                            {sizes.length > 0 ? sizes.join(", ") : "—"}
                        </span>
                    </div>

                    {/* Flavors */}
                    <div className="flex px-[10px] py-[10px] flex-col gap-[6px] items-start self-stretch grow shrink-0 basis-[0px] border-r-[1px] border-[#f3f4f6] relative z-[19] overflow-hidden">
                        <div className="w-full self-stretch shrink-0 text-[11px] font-regular whitespace-nowrap relative z-[20]">
                            <span className="text-[#a1a1aa] uppercase tracking-wider">Flavours</span>
                        </div>
                        <span className="flex w-full h-[36px] justify-start items-start self-stretch shrink-0 text-[13px] md:text-[12px] font-medium leading-[18px] text-[#242424] overflow-hidden break-words relative z-[21] line-clamp-2">
                            {flavors.length > 0 ? flavors.join(", ") : "—"}
                        </span>
                    </div>

                    {/* Stocks */}
                    <div className="flex w-[82px] px-[10px] py-[10px] flex-col gap-[6px] items-start self-stretch shrink-0 relative z-[22]">
                        <span className="self-stretch shrink-0 text-[11px] font-regular text-[#a1a1aa] uppercase tracking-wider relative z-[23]">
                            STOCK
                        </span>
                        <span className="self-stretch shrink-0 text-[13px] md:text-[12px] font-semibold text-[#74a134] whitespace-nowrap overflow-hidden text-ellipsis relative z-[24]">
                            {localProduct?.stock_count ?? stockCount} Units
                        </span>
                    </div>
                </div>
            </Link>

            {/* Interactive Action Menu */}
            <div className="absolute top-[12px] right-[12px] z-[50]">
                <ProductActionMenu
                    onUpdate={(updates) => handleUpdate(updates)}
                    onUpdatePrice={() => setIsPriceModalOpen(true)}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                    fullProduct={localProduct!}
                    onOpenChange={setIsActionMenuOpen}
                />
            </div>

            {/* Advanced Pricing Modal */}
            {localProduct && (
                <UpdatePriceModal
                    isOpen={isPriceModalOpen}
                    onClose={() => setIsPriceModalOpen(false)}
                    onSuccess={(updatedVariants) => {
                        if (localProduct) {
                            setLocalProduct({
                                ...localProduct,
                                product_variants: updatedVariants as any
                            });
                        }
                    }}
                    product={localProduct}
                />
            )}
        </article>
    );
}