'use client';

import React, { useEffect, useState } from 'react';
import DynamicPageNav from '@/components/layout/DynamicPageNav';
import AddressSelector from '@/components/checkout/AddressSelector';
import AddressModal from '@/components/checkout/AddressModal';
import { fetchUserAddressesAction, deleteUserAddressAction } from '@/app/actions/addressActions';
import { UserAddress } from '@/services/addressService';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/ToastProvider';

const AddressesPage = () => {
    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string>('');
    const [selectedAddressId, setSelectedAddressId] = useState<string>('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

    const { showToast } = useToast();

    useEffect(() => {
        const init = async () => {
            const { data } = await supabase.auth.getUser();
            if (data?.user) {
                setUserId(data.user.id);
            }
            fetchAddresses();
        };
        init();
    }, []);

    const fetchAddresses = async () => {
        setLoading(true);
        const { data, error } = await fetchUserAddressesAction();
        if (!error && data) {
            setAddresses(data);
            if (data.length > 0 && !selectedAddressId) {
                setSelectedAddressId(data[0].id || '');
            }
        }
        setLoading(false);
    };

    const handleSelectAddress = (id: string) => {
        setSelectedAddressId(id);
    };

    const handleAddNew = () => {
        setModalMode('add');
        setEditingAddress(null);
        setIsModalOpen(true);
    };

    const handleEdit = (id: string) => {
        const addressToEdit = addresses.find((addr) => addr.id === id);
        if (addressToEdit) {
            setEditingAddress(addressToEdit);
            setModalMode('edit');
            setIsModalOpen(true);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this address?")) return;

        const result = await deleteUserAddressAction(id);
        if (result.success) {
            showToast("Address deleted successfully!", "success");
            setAddresses((prev) => prev.filter((a) => a.id !== id));
            if (selectedAddressId === id) {
                setSelectedAddressId('');
            }
        } else {
            showToast(result.error || "Failed to delete address", "error");
        }
    };

    const handleModalSuccess = (address: UserAddress) => {
        // Simple re-fetch to keep it synced
        fetchAddresses();
        setIsModalOpen(false);
    };

    return (
        <div className=" bg-[#f7faf6] pt-[81px]">
            <DynamicPageNav title="Saved Addresses" />
            <main className="  w-full mx-auto min-h-screen max-w-[1280px] p-[24px] bg-white">
                <div className=" md:p-[48px] w-full relative min-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-full min-h-[200px]">
                            <p className="font-titillium text-[16px] text-[#838383]">Loading addresses...</p>
                        </div>
                    ) : addresses.length > 0 ? (
                        <div className="flex flex-col max-w-[800px] mx-auto gap-[32px]">
                            <AddressSelector
                                addresses={addresses}
                                selectedId={selectedAddressId}
                                onSelect={handleSelectAddress}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onAddNew={handleAddNew}
                            />

                            {/* Prominent yellow button as requested by user below the address selector */}
                            <button
                                onClick={handleAddNew}
                                className="w-full sm:w-[300px] mx-auto h-[52px] bg-[#ffe900] rounded-[12px] font-titillium font-bold text-[16px] text-[#242424] active:scale-[0.98] transition-transform flex items-center justify-center gap-[8px]"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Add New Location
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center h-full min-h-[300px] gap-[24px] pt-[100px]">
                            <div className="w-[80px] h-[80px] bg-[#f7faf6] rounded-full flex items-center justify-center">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#838383" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                            </div>
                            <div className="flex flex-col gap-[8px]">
                                <h2 className="font-titillium text-[24px] font-bold text-[#242424]">No Saved Addresses</h2>
                                <p className="font-titillium text-[16px] text-[#838383] max-w-[400px]">
                                    You haven't saved any addresses yet. Add a new address to make your checkout faster and easier.
                                </p>
                            </div>
                            <button
                                onClick={handleAddNew}
                                className="mt-[8px] px-[32px] h-[52px] bg-[#ffe900] rounded-[12px] font-titillium font-bold text-[16px] text-[#242424] active:scale-[0.98] transition-transform  flex items-center justify-center gap-[8px]"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Create New Address
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <AddressModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode={modalMode}
                userId={userId}
                initialAddress={editingAddress}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
};

export default AddressesPage;
