import React from 'react';
import HelpIcon from '@/components/icons/HelpIcon';

interface DeliveryDetailsProps {
    address: any;
    contact: any;
}

export default function DeliveryDetails({ address, contact }: DeliveryDetailsProps) {
    if (!address && !contact) {
        return (
            <section className="flex w-full flex-col items-start gap-[16px] bg-[#ffffff] p-[24px]">
                <h2 className="font-rajdhani text-[18px] font-[600] leading-[22px] tracking-[0.2px] text-[#242424]">
                    Delivery Details
                </h2>
                <p className="text-[14px] text-gray-500">Shipping information unavailable.</p>
            </section>
        );
    }

    const addressDetails = address?.addressDetails || address;
    const isPickup = address?.option === 'pickup';
    const isHome = address?.option === 'home';

    return (
        <section className="flex w-full flex-col items-start gap-[16px] bg-[#ffffff] p-[24px]">
            <h2 className="font-rajdhani text-[18px] font-[600] leading-[22px] tracking-[0.2px] text-[#242424]">
                Delivery Details
            </h2>
            <div className="flex w-full flex-col items-start rounded-[16px] border border-[#f1f5f9]">
                <div className="flex w-full flex-col items-start p-[16px] gap-[4px] border-b border-dashed border-[#f1f5f9]">
                    <span className="font-rajdhani text-[14px] font-[600] leading-[18px] text-[#242424]">
                        Preferred Shipping Method
                    </span>
                    <p className={`font-rajdhani text-[14px] font-[600] leading-[22px] mt-[4px] tracking-wide uppercase ${isPickup ? 'text-[#308026]' : 'text-[#A16207]'}`}>
                        {isPickup ? 'Pickup Station' : isHome ? 'Home Delivery' : address?.option || 'N/A'}
                    </p>
                </div>
                <div className="flex w-full flex-col items-start p-[16px] gap-[4px] border-b border-dashed border-[#f1f5f9]">
                    <span className="font-rajdhani text-[14px] font-[600] leading-[18px] text-[#242424]">
                        Shipping Address
                    </span>
                    <address className="not-italic font-rajdhani text-[14px] font-[500] leading-[22px] text-[#242424] mt-[4px]">
                        <span className="font-[600] block mb-[2px]">{addressDetails?.first_name} {addressDetails?.last_name}</span>
                        {addressDetails?.address_line_1 && <>{addressDetails.address_line_1}<br /></>}
                        {[addressDetails?.street, addressDetails?.area].filter(Boolean).join(', ')}<br />
                        {addressDetails?.city}, {addressDetails?.pincode}
                    </address>
                </div>
                <div className="flex w-full flex-col items-start p-[16px] gap-[4px]">
                    <span className="font-rajdhani text-[14px] font-[600] leading-[18px] text-[#242424]">
                        Contact Details
                    </span>
                    <p className="font-rajdhani text-[14px] font-[500] leading-[22px] text-[#242424] mt-[4px]">
                        {addressDetails?.email || contact?.value || 'N/A'} <br/>
                        <span className="font-[600] tracking-wide">{addressDetails?.phone || contact?.phone || 'N/A'}</span>
                    </p>
                </div>
            </div>
            {/* ... assistance buttons ... */}
            <div className="flex w-full flex-wrap items-center justify-between gap-[12px] pt-[8px]">
                <span className="font-rajdhani text-[12px] font-[500] leading-[18px] tracking-[-0.02px] text-[#242424]/50">
                    Need an support regarding details?
                </span>
                <button className="flex h-[32px] items-center justify-center gap-[4px] rounded-[8px] border border-[#f1f5f9] px-[10px] hover:bg-gray-50 transition-colors">
                    <div className="flex h-[16px] w-[16px] shrink-0 items-center justify-center">
                        <HelpIcon className="h-full w-full text-[#242424]" />
                    </div>
                    <span className="font-rajdhani text-[14px] font-[600] leading-[26px] tracking-[-0.03px] text-[#242424]">
                        Help and support
                    </span>
                </button>
            </div>
        </section>
    );
}
