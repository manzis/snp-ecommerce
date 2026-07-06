'use client';

import React from 'react';
import EditIcon from '@/components/icons/EyeIcon';
import PlusIcon from '@/components/icons/PlusIcon';

import { UserAddress } from '@/services/addressService';

interface AddressSelectorProps {
  addresses: UserAddress[];
  selectedId: string;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  addresses,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  onAddNew,
}) => {
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
                className={`relative w-full max-w-full min-w-0 flex justify-between items-start p-[16px] rounded-[12px] border transition-all cursor-pointer ${selectedId === addr.id ? 'border-[1.5px] border-[#242424] bg-[#fafbfb]' : 'border-[#eaebf0]'
                  }`}
              >
                <div className="flex flex-col gap-[4px] min-w-0 flex-1 max-w-[calc(100%-80px)]">
                  <p className="font-rajdhani text-[18px] text-[#242424] truncate w-full block">
                    <span className="font-semibold">Delivery To :</span> {addr.first_name} {addr.last_name}
                  </p>
                  <div className="flex flex-col text-[#838383] font-rajdhani min-w-0 w-full block">
                    <p className="text-[15px] truncate w-full block">
                      {addr.address_line_1}, {addr.street}, {addr.area ? `${addr.area}, ` : ''}{addr.city} - {addr.pincode}
                    </p>
                    <p className="text-[14px] truncate w-full block">
                      {addr.email} <span className="mx-1 text-[#eaebf0]">|</span> {addr.phone}
                    </p>
                  </div>
                </div>

                {selectedId === addr.id && (
                  <div className="absolute -top-[10px] left-[18px] flex items-center justify-center bg-white px-[10px] py-[4px] border border-black rounded-[24px] z-10">
                    <span className="font-rajdhani text-[12px] font-semibold leading-[14px] text-[#242424] tracking-[0.1px] whitespace-nowrap">
                      Selected
                    </span>
                  </div>
                )}

                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(addr.id!); }}
                  className="ml-[12px] flex items-center justify-center p-[4px_18px] border border-[#eaebf0] rounded-[8px] bg-white  active:scale-95 transition-transform shrink-0"
                >
                  <span className="font-rajdhani text-[13px] font-semibold text-[#6a6c6e]">Edit</span>
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(addr.id!); }}
                  className="absolute bottom-[12px] right-[16px] font-rajdhani text-[11px] font-semibold text-[#d92d20] hover:underline active:scale-95 transition-transform"
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
