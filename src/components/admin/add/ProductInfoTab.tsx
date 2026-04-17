import React, { useState } from 'react';
import AdminDropdown from '@/components/admin/shared/AdminDropdown';
import MultiImageUpload from '@/components/admin/products/MultiImageUpload';
import { ErrorText } from './shared';
import CategoryModal from '@/components/admin/categories/CategoryModal';
import BrandModal from '@/components/admin/brands/BrandModal';
import SellerModal from '@/components/admin/sellers/SellerModal';
import { createCategoryAction } from '@/app/actions/categoryActions';
import { createBrandAction } from '@/app/actions/brandActions';
import { createSellerAction } from '@/app/actions/sellerActions';
import { useAdminToast } from '@/components/admin/ui/AdminToastProvider';

export default function ProductInfoTab({ formData, setFormData, categories, brands, sellers, showErrors, errors, onRefreshMetadata }: any) {
    const { showAdminToast } = useAdminToast();
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showBrandModal, setShowBrandModal] = useState(false);
    const [showSellerModal, setShowSellerModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleCreateCategory = async (id: string | null, data: any) => {
        setIsSaving(true);
        try {
            const res = await createCategoryAction(data);
            if (res.success) {
                showAdminToast('Category created successfully', 'success');
                await onRefreshMetadata();
                setFormData({ ...formData, category_id: res.data.id });
                setShowCategoryModal(false);
            } else {
                showAdminToast(res.message || 'Failed to create category', 'error');
            }
        } catch (err) {
            showAdminToast('An error occurred', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateBrand = async (id: string | null, data: any) => {
        setIsSaving(true);
        try {
            const res = await createBrandAction(data);
            if (res.success) {
                showAdminToast('Brand created successfully', 'success');
                await onRefreshMetadata();
                setFormData({ ...formData, brand_id: res.data.id });
                setShowBrandModal(false);
            } else {
                showAdminToast(res.message || 'Failed to create brand', 'error');
            }
        } catch (err) {
            showAdminToast('An error occurred', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateSeller = async (id: string | null, data: any) => {
        setIsSaving(true);
        try {
            const res = await createSellerAction(data);
            if (res.success) {
                showAdminToast('Seller created successfully', 'success');
                await onRefreshMetadata();
                setFormData({ ...formData, seller_id: res.data.id });
                setShowSellerModal(false);
            } else {
                showAdminToast(res.message || 'Failed to create seller', 'error');
            }
        } catch (err) {
            showAdminToast('An error occurred', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-10 max-w-4xl">
            {/* ... existing sections ... */}
            <section className="space-y-6">
                <h3 className="text-[15px] font-medium text-[#242424] tracking-tight">Product info</h3>
                <div className="flex flex-col gap-2">
                    <label className="text-[12.5px] font-regular text-[#71717a]">Product Name <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Creatine Monohydrate"
                        data-error={showErrors && formData.name.trim() === '' ? "true" : "false"}
                        className={`w-full bg-white border rounded-xl px-4 py-3 text-[14px] font-regular placeholder:text-zinc-400 placeholder:font-regular outline-none transition-all ${showErrors && formData.name.trim() === '' ? 'border-red-500 bg-red-50/10' : 'border-gray-200 focus:border-black'}`}
                    />
                    <ErrorText show={showErrors && formData.name.trim() === ''}>Product name is required</ErrorText>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[12.5px] font-regular text-[#71717a]">Display Title <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Asitis Nutrition Creatine Monohydrate 250g"
                            data-error={showErrors && formData.title.trim() === '' ? "true" : "false"}
                            className={`w-full bg-white border rounded-xl px-4 py-3 text-[14px] font-regular placeholder:text-zinc-400 placeholder:font-regular outline-none transition-all ${showErrors && formData.title.trim() === '' ? 'border-red-500 bg-red-50/10' : 'border-gray-200 focus:border-black'}`}
                        />
                        <ErrorText show={showErrors && formData.title.trim() === ''}>Display title is required for SEO</ErrorText>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[12.5px] font-regular text-[#71717a]">Slug (URL)</label>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value, hasManuallyEditedSlug: true })}
                            placeholder="creatine-monohydrate-250g"
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-mono placeholder:text-zinc-400 placeholder:font-regular focus:border-black outline-none transition-all"
                        />
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-[15px] font-medium text-[#242424] tracking-tight">Base Pricing</h3>
                    <p className="text-[11px] text-[#71717a] font-regular italic">Displayed when no specific variant is selected</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-zinc-50/50 border border-zinc-100 rounded-2xl">
                    <div className="flex flex-col gap-2">
                        <label className="text-[12.5px] font-regular text-[#71717a]">Original Price (MRP) <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            value={formData.original_price}
                            onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                            placeholder="e.g. 2999"
                            data-error={showErrors && !formData.original_price ? "true" : "false"}
                            className={`w-full bg-white border rounded-xl px-4 py-3 text-[14px] font-regular outline-none transition-all ${showErrors && !formData.original_price ? 'border-red-500 bg-red-50/10' : 'border-gray-200 focus:border-black'}`}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[12.5px] font-regular text-[#71717a]">Discounted Price (Sale) <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            value={formData.discounted_price}
                            onChange={(e) => setFormData({ ...formData, discounted_price: e.target.value })}
                            placeholder="e.g. 2499"
                            data-error={(showErrors && !formData.discounted_price) || (showErrors && Number(formData.original_price) < Number(formData.discounted_price)) ? "true" : "false"}
                            className={`w-full bg-white border rounded-xl px-4 py-3 text-[14px] font-medium outline-none transition-all ${(showErrors && !formData.discounted_price) || (showErrors && Number(formData.original_price) < Number(formData.discounted_price)) ? 'border-red-500 bg-red-50/10' : 'border-gray-200 focus:border-black'}`}
                        />
                         {showErrors && formData.original_price && formData.discounted_price && Number(formData.original_price) < Number(formData.discounted_price) && (
                            <div className="text-red-500 text-[11px] font-medium mt-1">Sale price cannot exceed the original MRP.</div>
                        )}
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <h3 className="text-[15px] font-medium text-[#242424] tracking-tight">Vendor and Classification</h3>
                <div className="bg-gray-50/80 border border-gray-100 p-6 rounded-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <AdminDropdown
                            label="Category"
                            required
                            value={formData.category_id}
                            options={(categories || []).map((c: any) => ({
                                id: c.id,
                                name: c.name,
                                image: c.image_url
                            }))}
                            onChange={(id: string) => setFormData({ ...formData, category_id: id })}
                            placeholder="Select Category"
                            error="Category is required"
                            showError={showErrors && formData.category_id === ''}
                            onCreateNew={() => setShowCategoryModal(true)}
                            createNewLabel="Create Category"
                        />

                        <AdminDropdown
                            label="Brand"
                            required
                            value={formData.brand_id}
                            options={(brands || []).map((b: any) => ({
                                id: b.id,
                                name: b.name,
                                image: b.image_url
                            }))}
                            onChange={(id: string) => setFormData({ ...formData, brand_id: id })}
                            placeholder="Select Brand"
                            error="Brand is mandatory"
                            showError={showErrors && formData.brand_id === ''}
                            onCreateNew={() => setShowBrandModal(true)}
                            createNewLabel="Create Brand"
                        />

                        <AdminDropdown
                            label="Seller Info"
                            required
                            value={formData.seller_id}
                            options={(sellers || []).map((s: any) => ({
                                id: s.id,
                                name: s.name + (s.is_verified ? ' ✓' : ''),
                                image: s.image_url,
                                subtext: s.details ? s.details.substring(0, 30) + '...' : undefined
                            }))}
                            onChange={(id: string) => setFormData({ ...formData, seller_id: id })}
                            placeholder="Select Seller"
                            error="Seller info is mandatory"
                            showError={showErrors && formData.seller_id === ''}
                            onCreateNew={() => setShowSellerModal(true)}
                            createNewLabel="Create Seller"
                        />
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <h3 className="text-[15px] font-medium text-[#242424] tracking-tight">Image Gallery</h3>
                <div className="flex flex-col gap-4">
                    <p className="text-[12px] text-[#71717a] font-regular px-1">Detailed visuals help customers make better buying decisions. (Max 6 images)</p>
                    <div className={`p-1 rounded-2xl transition-all ${showErrors && !formData.images.some((img: string) => img && img.trim() !== '') ? 'bg-red-50/30 ring-1 ring-red-200' : ''}`}>
                        <MultiImageUpload
                            images={formData.images}
                            onChange={(urls) => setFormData({ ...formData, images: urls })}
                            path={`products/${formData.slug || 'new-product'}`}
                            maxImages={6}
                        />
                    </div>
                    {showErrors && !formData.images.some((img: string) => img && img.trim() !== '') && (
                        <ErrorText>At least one product image is required to publish.</ErrorText>
                    )}
                </div>
            </section>

            {/* Inline Creation Modals */}
            <CategoryModal 
                isOpen={showCategoryModal}
                onClose={() => setShowCategoryModal(false)}
                onSave={handleCreateCategory}
                isSaving={isSaving}
            />
            <BrandModal 
                isOpen={showBrandModal}
                onClose={() => setShowBrandModal(false)}
                onSave={handleCreateBrand}
                isSaving={isSaving}
            />
            <SellerModal 
                isOpen={showSellerModal}
                onClose={() => setShowSellerModal(false)}
                onSave={handleCreateSeller}
                isSaving={isSaving}
            />
        </div>
    );
}
