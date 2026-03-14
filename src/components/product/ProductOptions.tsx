import React from 'react';
import FlavourSelection from './FalvourSelction';
import SizeSelection from './SizeSelction';
import OfferCard from './OfferCard';
import DeliveryDetails from './DeliveryDetails';

const ProductOptions: React.FC = () => {
  return (
    <section className="relative flex w-full  lg:max-w-none flex-col items-start gap-[30px] mx-auto lg:mx-0">
      <FlavourSelection />
      <SizeSelection />
      <OfferCard />
      <DeliveryDetails />
    </section>
  );
};

export default ProductOptions;