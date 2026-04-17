'use client';

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Category } from "@/services/productService";
import CategoryActionMenu from "./CategoryActionMenu";

// --- SUB-COMPONENT: CATEGORY CARD ---
export const CategoryCard = ({ 
    category, 
    onEditAction, 
    onDeleteAction 
}: { 
    category: Category;
    onEditAction?: (category: Category) => void;
    onDeleteAction?: (id: string) => void;
}) => {
    return (
        <div className="flex flex-col gap-[10px] justify-center items-start w-full relative group font-rubik">
            {/* Category Image Container */}
            <div className="h-[160px] w-full relative shrink-0 bg-[#f4f4f5] rounded-[24px] overflow-hidden transition-shadow">
                <Link
                    href={`/admin/categories/${category.slug || category.id}`}
                    className="absolute inset-0 z-[1]"
                >
                    <Image
                        src={category.image_url || "/images/placeholder-category.png"}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-[300ms] ease-in-out group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                    />
                </Link>

                {/* Action Icon Button */}
                <div className="absolute top-[10px] right-[10px] z-[10]">
                    <CategoryActionMenu 
                        category={category}
                        onEdit={onEditAction}
                        onDelete={onDeleteAction}
                    />
                </div>

                {/* Product Count Badge - Minimalist without border/shadow */}
                <div className="absolute bottom-[10px] left-[10px] z-[10] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-2xl flex items-center gap-1.5">
                    <span className="text-[12px] font-semibold text-[#242424]">{category.product_count || 0}</span>
                    <span className="text-[10px] text-[#71717a] font-medium uppercase tracking-tight">Products</span>
                </div>
            </div>

            {/* Category Details */}
            <div className="flex px-[4px] flex-col gap-[8px] justify-center items-start self-stretch shrink-0 relative z-[6]">
                <div className="flex flex-col gap-1 w-full">
                    {/* Title */}
                    <Link href={`/admin/categories/${category.slug || category.id}`}>
                        <div className="flex items-center gap-2">
                             <h3 className="text-[15px] font-[600] leading-[20px] text-[#242424] hover:underline underline-offset-4 decoration-zinc-300 transition-all">
                                {category.name}
                            </h3>
                            {category.is_other_category && (
                                <span className="bg-[#f4f4f5] text-[#242424] font-semibold border border-[#d4d4d8] px-1.5 py-0.5 rounded-[4px] text-[9px] uppercase tracking-wider leading-none shrink-0">Other</span>
                            )}
                        </div>
                    </Link>
                    
                    {/* Slug */}
                    <span className="text-[11px] text-[#a1a1aa] font-mono leading-none">
                         /{category.slug || category.id}
                    </span>
                </div>

                {/* Description */}
                <p className="text-[12px] text-[#71717a] line-clamp-2 leading-relaxed h-[36px] overflow-hidden">
                    {category.description ? (
                        <>
                            {category.description}
                            {category.description.length > 80 && (
                                <span className="text-[#a1a1aa] ml-1">..more</span>
                            )}
                        </>
                    ) : (
                        <span className="text-[#d4d4d8] italic lowercase">no description</span>
                    )}
                </p>
            </div>
        </div>
    );
};

// --- MAIN EXPORT: CATEGORY GRID ---
export default function CategoryGrid({ 
    categories,
    onEditAction,
    onDeleteAction
}: { 
    categories: Category[];
    onEditAction?: (category: Category) => void;
    onDeleteAction?: (id: string) => void;
}) {
    if (categories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <p className="text-lg font-medium">No categories found</p>
                <p className="text-sm">Try adding a new category or adjusting your filters.</p>
            </div>
        );
    }

    return (
        <section className="w-full">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-[16px] gap-y-[24px] items-start relative w-full">
                {categories.map((category) => (
                    <CategoryCard 
                        key={category.id} 
                        category={category} 
                        onEditAction={onEditAction} 
                        onDeleteAction={onDeleteAction} 
                    />
                ))}
            </div>
        </section>
    );
}
