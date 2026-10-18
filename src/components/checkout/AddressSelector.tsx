'use client';

import React from 'react';
import EditIcon from '@/components/icons/EyeIcon';
import PlusIcon from '@/components/icons/PlusIcon';

import { UserAddress } from '@/services/addressService';

interface AddressSelectorProps {
  addresses: UserAddress[];
  selectedId: string;
  isLoading?: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  addresses,
  selectedId,
  isLoading = false,
  onSelect,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  if (isLoading) {
    return (
      <div className="w-full max-w-full min-w-0 flex flex-col gap-[20px] animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-[22px] w-[170px] bg-[#eaebf0] rounded-[6px]" />
          <div className="h-[28px] w-[80px] bg-[#eaebf0] rounded-[8px]" />
        </div>
        <div className="w-full max-w-full min-w-0 flex flex-col gap-[12px]">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="w-full p-[16px] rounded-[12px] border border-[#eaebf0] bg-[#fafbfb] flex justify-between items-start"
            >
              <div className="flex flex-col gap-[8px] flex-1 max-w-[calc(100%-80px)]">
                <div className="h-[18px] w-[160px] bg-[#eaebf0] rounded-[4px]" />
                <div className="h-[14px] w-[220px] bg-[#eaebf0] rounded-[4px]" />
                <div className="h-[12px] w-[180px] bg-[#eaebf0] rounded-[4px]" />
              </div>
              <div className="h-[30px] w-[54px] bg-[#eaebf0] rounded-[8px] shrink-0" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full min-w-0 flex flex-col gap-[24px]">
      {addresses.length > 0 ? (
        <div className="w-full max-w-full min-w-0 flex flex-col gap-[20px]">
          <div className="flex justify-between items-center">
            <span className="font-rajdhani text-[18px] font-semibold leading-[22px] text-[#242424]">
              Your saved addresses:
            </span>
            <button
              onClick={onAddNew}
              className="flex items-center gap-[4px] px-[12px] py-[4px] bg-[#F2F8EE]  rounded-[8px] active:scale-95 transition-transform "
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#308026" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span className="font-rajdhani text-[14px] font-semibold text-[#308026]">Add New</span>
            </button>
          </div>

          <div className="w-full max-w-full min-w-0 flex flex-col gap-[12px]">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                onClick={() => onSelect(addr.id!)}
                className={`relative w-full max-w-full min-w-0 flex justify-between items-start p-[16px] rounded-[14px] border transition-all cursor-pointer ${
                  selectedId === addr.id
                    ? 'border-[1.5px] border-[#308026] bg-[#f7faf6]'
                    : 'border-[#eaebf0] bg-white hover:border-[#d0d5dd]'
                }`}
              >
                <div className="flex flex-col gap-[4px] min-w-0 flex-1 max-w-[calc(100%-80px)]">
                  <div className="flex items-center gap-[6px] flex-wrap">
                    <p className="font-rajdhani text-[17px] sm:text-[18px] text-[#18181b] font-bold truncate">
                      {addr.first_name} {addr.last_name}
                    </p>
                    {addr.type && (
                      <span className="font-rajdhani text-[11px] font-semibold uppercase tracking-wider bg-[#f4f4f5] text-[#52525b] px-2 py-0.5 rounded-[4px]">
                        {addr.type}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col text-[#71717a] font-rajdhani min-w-0 w-full block">
                    <p className="text-[14px] sm:text-[15px] truncate w-full block font-medium">
                      {addr.address_line_1}, {addr.street}, {addr.area ? `${addr.area}, ` : ''}{addr.city} - {addr.pincode}
                    </p>
                    <p className="text-[13px] sm:text-[14px] truncate w-full block mt-0.5">
                      {addr.email} <span className="mx-1 text-[#eaebf0]">|</span> {addr.phone}
                      {addr.alt_phone && (
                        <span> <span className="mx-1 text-[#eaebf0]">|</span> Alt: {addr.alt_phone}</span>
                      )}
                    </p>
                    {addr.delivery_notes && (
                      <p className="text-[12px] text-[#52525b] italic truncate w-full block mt-1 bg-[#f4f4f5]/80 px-2 py-0.5 rounded-[4px] border border-[#eaebf0]/60">
                        <span className="font-semibold not-italic text-[#3f3f46]">Note:</span> {addr.delivery_notes}
                      </p>
                    )}
                  </div>
                </div>

                {selectedId === addr.id && (
                  <div className="absolute -top-[10px] left-[18px] flex items-center justify-center bg-[#308026] text-white px-[8px] py-[2px] rounded-[6px] shadow-sm z-10">
                    <span className="font-rajdhani text-[11px] font-bold leading-[12px] text-white tracking-[0.3px] uppercase">
                      Selected
                    </span>
                  </div>
                )}

                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(addr.id!); }}
                  className="ml-[12px] flex items-center justify-center px-[12px] py-[4px] border border-[#eaebf0] rounded-[8px] bg-white hover:bg-gray-50 active:scale-95 transition-all shrink-0"
                >
                  <span className="font-rajdhani text-[13px] font-semibold text-[#52525b]">Edit</span>
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(addr.id!); }}
                  className="absolute bottom-[12px] right-[16px] font-rajdhani text-[12px] font-semibold text-[#ef4444] hover:underline active:scale-95 transition-transform"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty State with Add New */
        <div className="flex justify-between items-end w-full pt-[8px] gap-[24px]">
          <div className="flex flex-col gap-[16px] flex-grow">
            <p className="font-rajdhani text-[14px] text-[#838383] leading-[22px]">
              No Saved addresses Found, Try Adding a New address !
            </p>
          </div>
          <button
            onClick={onAddNew}
            className="shrink-0 flex items-center gap-[6px] p-[8px_12px] rounded-[8px] bg-[#242424] active:scale-95 transition-all"
          >
            <span className="font-rajdhani text-[14px] font-semibold text-white">Add new</span>
            <PlusIcon className="w-[16px] h-[16px] text-white rotate-180" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AddressSelector;
