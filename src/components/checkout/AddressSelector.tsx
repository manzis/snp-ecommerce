'use client';

import React from 'react';
import EditIcon from '@/components/icons/EyeIcon';
import PlusIcon from '@/components/icons/ArrowDown';

interface Address {
  id: string;
  name: string;
  addressLine: string;
  email: string;
  phone: string;
  type: 'Home' | 'Work' | 'Other';
}

interface AddressSelectorProps {
  addresses: Address[];
  selectedId: string;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onAddNew: () => void;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  addresses,
  selectedId,
  onSelect,
  onEdit,
  onAddNew,
}) => {
  return (
    <div className="flex flex-col gap-[24px]">
      {addresses.length > 0 ? (
        <div className="flex flex-col gap-[24px]">
          <span className="font-titillium text-[18px] font-semibold leading-[22px] text-[#242424]">
            Your saved addresses:
          </span>

          <div className="flex flex-col gap-[12px]">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                onClick={() => onSelect(addr.id)}
                className={`relative flex justify-between items-start p-[16px] rounded-[12px] border transition-all cursor-pointer ${
                  selectedId === addr.id ? 'border-[1.5px] border-[#242424] bg-[#fafbfb]' : 'border-[#eaebf0]'
                }`}
              >
                <div className="flex flex-col gap-[4px] min-w-0 flex-1">
                  <p className="font-titillium text-[18px] text-[#242424] truncate">
                    <span className="font-semibold">Delivery To :</span> {addr.name}
                  </p>
                  <div className="flex flex-col text-[#838383] font-titillium min-w-0">
                    <span className="text-[15px] truncate">{addr.addressLine}</span>
                    <span className="text-[14px] truncate">
                      {addr.email} <span className="mx-1 text-[#eaebf0]">|</span> {addr.phone}
                    </span>
                  </div>
                </div>

                {selectedId === addr.id && (
                  <div className="absolute -top-[10px] left-[18px] flex items-center justify-center bg-white px-[10px] py-[4px] border border-black rounded-[24px] z-10">
                    <span className="font-titillium text-[12px] font-semibold leading-[14px] text-[#242424] tracking-[0.1px] whitespace-nowrap">
                      Selected
                    </span>
                  </div>
                )}

                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(addr.id); }}
                  className="ml-[12px] flex items-center gap-[6px] p-[8px_12px] border border-[#eaebf0] rounded-[6px] bg-white shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] active:scale-95 transition-transform"
                >
                  <span className="font-titillium text-[14px] font-semibold text-[#6a6c6e]">Edit</span>
                  <EditIcon className="w-[16px] h-[16px] text-[#6a6c6e]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty State with Add New */
        <div className="flex justify-between items-end w-full pt-[8px] gap-[24px]">
          <div className="flex flex-col gap-[16px] flex-grow">
            <p className="font-titillium text-[16px] text-[#838383] leading-[22px]">
              No Saved addresses Found, Try Adding a New address !
            </p>
          </div>
          <button
            onClick={onAddNew}
            className="shrink-0 flex items-center gap-[6px] p-[8px_12px] border border-[#eaebf0] rounded-[6px] bg-white shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] active:scale-95 transition-all"
          >
            <span className="font-titillium text-[16px] font-semibold text-[#6a6c6e]">Add new</span>
            <PlusIcon className="w-[16px] h-[16px] text-[#6a6c6e] rotate-180" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AddressSelector;