'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAddress } from '@/services/addressService';
import { saveUserAddressAction, deleteUserAddressAction } from '@/app/actions/addressActions';
import { useToast } from '@/components/ui/ToastProvider';
import MapSelector from './MapSelector';
import { reverseGeocode } from '@/utils/geocode';
import { supabase } from '@/lib/supabase/client';
import { useCheckoutStore } from '@/store/checkoutStore';
import { useUIStore } from '@/store/uiStore';


interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  userId: string;
  initialAddress?: UserAddress | null;
  onSuccess: (address: UserAddress) => void;
  targetUserId?: string;
}

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose, mode, userId, initialAddress, onSuccess, targetUserId }) => {
  const { showToast } = useToast();
  const contactData = useCheckoutStore(state => state.contactData);
  const [formData, setFormData] = useState<Partial<UserAddress>>({
    first_name: '', last_name: '', address_line_1: '', city: '', pincode: '', street: '', area: '', email: '', phone: '', type: 'Home'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [tempLat, setTempLat] = useState(27.7172);
  const [tempLng, setTempLng] = useState(85.3240);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const setHideBottomNav = useUIStore(state => state.setHideBottomNav);

  useEffect(() => {
    setHideBottomNav(isOpen);
    return () => setHideBottomNav(false);
  }, [isOpen, setHideBottomNav]);

  useEffect(() => {
    if (isOpen) {
      setIsMapFullscreen(false);
      if (mode === 'edit' && initialAddress) {
        setFormData(initialAddress);
        if (initialAddress.latitude && initialAddress.longitude) {
          setTempLat(initialAddress.latitude);
          setTempLng(initialAddress.longitude);
        }
      } else {
        const isEmail = contactData?.value?.includes('@');
        const prefillEmail = isEmail ? contactData.value : '';

        setFormData({ first_name: '', last_name: '', address_line_1: '', city: '', pincode: '', street: '', area: '', email: prefillEmail, phone: '', type: 'Home', latitude: 27.7172, longitude: 85.3240 });
        setTempLat(27.7172);
        setTempLng(85.3240);

        if (!prefillEmail) {
          supabase.auth.getUser().then(({ data }) => {
            if (data?.user?.email) {
              setFormData(prev => ({ ...prev, email: data.user.email }));
            }
          });
        }
      }
      setErrors({});
    }
  }, [isOpen, mode, initialAddress, contactData?.value]);

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.first_name) newErrors.first_name = "First name is required";
    if (!formData.last_name) newErrors.last_name = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    if (!formData.address_line_1) newErrors.address_line_1 = "Address Line 1 is required";
    if (!formData.street) newErrors.street = "Street name is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.pincode) newErrors.pincode = "Pincode is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    const result = await saveUserAddressAction(formData as UserAddress, targetUserId);
    setIsSaving(false);
    if (result.data) {
      showToast("Address saved successfully!", "success");
      onSuccess(result.data);
      onClose();
    } else {
      showToast(result.error || "Failed to save address", "error");
    }
  };

  const handleDelete = async () => {
    if (!formData.id) return;

    if (!confirm("Are you sure you want to delete this address?")) return;

    setIsDeleting(true);
    const result = await deleteUserAddressAction(formData.id, targetUserId);
    setIsDeleting(false);

    if (result.success) {
      showToast("Address deleted successfully!", "success");
      // Call onSuccess or close; delivery section triggers re-fetch on success. 
      // We'll just call onClose and let DeliverySection know it was deleted if we want, or just trigger an empty address map.
      // Wait, onSuccess requires a UserAddress. Let's just pass formData and let the parent refresh!
      onSuccess(formData as UserAddress);
      onClose();
    } else {
      showToast(result.error || "Failed to delete address", "error");
    }
  };

  const handleConfirmLocation = async () => {
    setIsGeocoding(true);
    const geoData = await reverseGeocode(tempLat, tempLng);
    setIsGeocoding(false);

    if (geoData) {
      setFormData(prev => ({
        ...prev,
        latitude: tempLat,
        longitude: tempLng,
        city: geoData.city || prev.city,
        pincode: geoData.pincode || prev.pincode,
        street: geoData.street || prev.street,
        area: geoData.area || prev.area,
        address_line_1: geoData.address_line_1 || prev.address_line_1,
      }));
    } else {
      // Just save coordinates if geocoding fails
      setFormData(prev => ({ ...prev, latitude: tempLat, longitude: tempLng }));
    }
    setIsMapFullscreen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* OVERLAY */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px]"
          />

          {/* PANEL */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className={`fixed bottom-0 left-0 right-0 z-[70] flex flex-col w-full bg-white rounded-t-[24px] overflow-hidden transition-all duration-300 ${isMapFullscreen ? 'h-[95vh]' : 'h-[90%] max-h-[850px]'}`}
          >
            {/* CLOSE HANDLE */}
            <div className="flex justify-center p-[16px]">
              <button onClick={() => isMapFullscreen ? setIsMapFullscreen(false) : onClose()} className="w-[40px] h-[5px] bg-[#eaebf0] rounded-full" />
            </div>

            {!isMapFullscreen ? (
              // NORMAL FORM VIEW
              <div className="flex flex-col gap-[20px] px-[24px] pb-[32px] overflow-y-auto w-full">
                <div className="flex justify-between items-center">
                  <h2 className="font-titillium text-[20px] font-bold text-[#242424]">
                    {mode === 'add' ? 'Add New Address' : 'Edit Address'}
                  </h2>
                  {mode === 'edit' && (
                    <button
                      disabled={isDeleting}
                      onClick={handleDelete}
                      className="font-titillium font-semibold text-[13px] text-[#d92d20] bg-[#fff0f0] px-[8px] py-[4px] rounded-[6px] hover:underline active:scale-95 transition-transform"
                    >
                      {isDeleting ? "Removing..." : "Remove address"}
                    </button>
                  )}
                </div>

                {/* SELECT ON MAP CTA BUTTON */}
                <button
                  onClick={() => setIsMapFullscreen(true)}
                  className="flex items-center justify-center gap-[8px] w-full py-[12px] rounded-[10px] bg-[#eaffcc] border border-[#d6fa9e] text-[#308026] transition-transform active:scale-95"
                >
                  <LocationIcon />
                  <span className="font-titillium font-bold text-[15px]">Choose exact location on map</span>
                </button>

                {/* FORM FIELDS */}
                <div className="flex flex-col gap-[12px]">
                  <div className="flex gap-[12px]">
                    <div className="flex flex-col flex-1">
                      <label className="text-[12px] font-titillium font-medium text-[#838383] mb-[4px] ml-[4px]">First Name*</label>
                      <motion.input
                        animate={errors.first_name ? { x: [-5, 5, -5, 5, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        type="text" placeholder="John" value={formData.first_name || ''}
                        onChange={(e) => { setFormData({ ...formData, first_name: e.target.value }); setErrors(prev => ({ ...prev, first_name: '' })); }}
                        className={`w-full h-[50px] px-[16px] border outline-none transition-colors rounded-[8px] font-titillium ${errors.first_name ? 'border-[#d92d20] border-[1.5px]' : 'border-[#eaebf0] border-[1px] focus:border-[#242424] focus:border-[1.5px]'}`}
                      />
                      {errors.first_name && <span className="text-[#d92d20] text-[11px] font-titillium mt-[2px] ml-[4px]">{errors.first_name}</span>}
                    </div>
                    <div className="flex flex-col flex-1">
                      <label className="text-[12px] font-titillium font-medium text-[#838383] mb-[4px] ml-[4px]">Last Name*</label>
                      <motion.input
                        animate={errors.last_name ? { x: [-5, 5, -5, 5, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        type="text" placeholder="Doe" value={formData.last_name || ''}
                        onChange={(e) => { setFormData({ ...formData, last_name: e.target.value }); setErrors(prev => ({ ...prev, last_name: '' })); }}
                        className={`w-full h-[50px] px-[16px] border outline-none transition-colors rounded-[8px] font-titillium ${errors.last_name ? 'border-[#d92d20] border-[1.5px]' : 'border-[#eaebf0] border-[1px] focus:border-[#242424] focus:border-[1.5px]'}`}
                      />
                      {errors.last_name && <span className="text-[#d92d20] text-[11px] font-titillium mt-[2px] ml-[4px]">{errors.last_name}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-[12px]">
                    <div className="flex flex-col">
                      <label className="text-[12px] font-titillium font-medium text-[#838383] mb-[4px] ml-[4px]">Email*</label>
                      <motion.input
                        animate={errors.email ? { x: [-5, 5, -5, 5, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        type="email" placeholder="john@example.com" value={formData.email || ''}
                        onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErrors(prev => ({ ...prev, email: '' })); }}
                        className={`w-full h-[50px] px-[16px] border outline-none transition-colors rounded-[8px] font-titillium ${errors.email ? 'border-[#d92d20] border-[1.5px]' : 'border-[#eaebf0] border-[1px] focus:border-[#242424] focus:border-[1.5px]'}`}
                      />
                      {errors.email && <span className="text-[#d92d20] text-[11px] font-titillium mt-[2px] ml-[4px]">{errors.email}</span>}
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[12px] font-titillium font-medium text-[#838383] mb-[4px] ml-[4px]">Phone*</label>
                      <motion.div
                        animate={errors.phone ? { x: [-5, 5, -5, 5, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        className={`flex items-center w-full h-[50px] border outline-none transition-colors rounded-[8px] font-titillium overflow-hidden ${errors.phone ? 'border-[#d92d20] border-[1.5px]' : 'border-[#eaebf0] border-[1px] focus-within:border-[#242424] focus-within:border-[1.5px]'}`}
                      >
                        <div className="h-full px-[12px] flex items-center justify-center bg-[#f7f8f9] border-r border-[#eaebf0] text-[#838383] font-medium text-[14px]">
                          +977
                        </div>
                        <input
                          type="tel" placeholder="98XXXXXXXX" value={formData.phone || ''}
                          onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setErrors(prev => ({ ...prev, phone: '' })); }}
                          className="flex-1 h-full px-[12px] outline-none"
                        />
                      </motion.div>
                      {errors.phone && <span className="text-[#d92d20] text-[11px] font-titillium mt-[2px] ml-[4px]">{errors.phone}</span>}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[12px] font-titillium font-medium text-[#838383] mb-[4px] ml-[4px]">Address Line 1*</label>
                    <motion.input
                      animate={errors.address_line_1 ? { x: [-5, 5, -5, 5, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      type="text" placeholder="Apartment, suite, unit etc." value={formData.address_line_1 || ''}
                      onChange={(e) => { setFormData({ ...formData, address_line_1: e.target.value }); setErrors(prev => ({ ...prev, address_line_1: '' })); }}
                      className={`w-full h-[50px] px-[16px] border outline-none transition-colors rounded-[8px] font-titillium ${errors.address_line_1 ? 'border-[#d92d20] border-[1.5px]' : 'border-[#eaebf0] border-[1px] focus:border-[#242424] focus:border-[1.5px]'}`}
                    />
                    {errors.address_line_1 && <span className="text-[#d92d20] text-[11px] font-titillium mt-[2px] ml-[4px]">{errors.address_line_1}</span>}
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[12px] font-titillium font-medium text-[#838383] mb-[4px] ml-[4px]">Street Name*</label>
                    <motion.input
                      animate={errors.street ? { x: [-5, 5, -5, 5, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      type="text" placeholder="Putalisadak" value={formData.street || ''}
                      onChange={(e) => { setFormData({ ...formData, street: e.target.value }); setErrors(prev => ({ ...prev, street: '' })); }}
                      className={`w-full h-[50px] px-[16px] border outline-none transition-colors rounded-[8px] font-titillium ${errors.street ? 'border-[#d92d20] border-[1.5px]' : 'border-[#eaebf0] border-[1px] focus:border-[#242424] focus:border-[1.5px]'}`}
                    />
                    {errors.street && <span className="text-[#d92d20] text-[11px] font-titillium mt-[2px] ml-[4px]">{errors.street}</span>}
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[12px] font-titillium font-medium text-[#838383] mb-[4px] ml-[4px]">Area / Landmark (Optional)</label>
                    <input type="text" placeholder="Near Times Square" value={formData.area || ''} onChange={(e) => setFormData({ ...formData, area: e.target.value })} className="w-full h-[50px] px-[16px] border outline-none transition-colors rounded-[8px] font-titillium border-[#eaebf0] border-[1px] focus:border-[#242424] focus:border-[1.5px]" />
                  </div>

                  <div className="flex gap-[12px]">
                    <div className="flex flex-col flex-[2]">
                      <label className="text-[12px] font-titillium font-medium text-[#838383] mb-[4px] ml-[4px]">City*</label>
                      <motion.input
                        animate={errors.city ? { x: [-5, 5, -5, 5, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        type="text" placeholder="Kathmandu" value={formData.city || ''}
                        onChange={(e) => { setFormData({ ...formData, city: e.target.value }); setErrors(prev => ({ ...prev, city: '' })); }}
                        className={`w-full h-[50px] px-[16px] border outline-none transition-colors rounded-[8px] font-titillium ${errors.city ? 'border-[#d92d20] border-[1.5px]' : 'border-[#eaebf0] border-[1px] focus:border-[#242424] focus:border-[1.5px]'}`}
                      />
                      {errors.city && <span className="text-[#d92d20] text-[11px] font-titillium mt-[2px] ml-[4px]">{errors.city}</span>}
                    </div>
                    <div className="flex flex-col flex-1">
                      <label className="text-[12px] font-titillium font-medium text-[#838383] mb-[4px] ml-[4px]">Pincode*</label>
                      <motion.input
                        animate={errors.pincode ? { x: [-5, 5, -5, 5, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        type="text" placeholder="44600" value={formData.pincode || ''}
                        onChange={(e) => { setFormData({ ...formData, pincode: e.target.value }); setErrors(prev => ({ ...prev, pincode: '' })); }}
                        className={`w-full h-[50px] px-[16px] border outline-none transition-colors rounded-[8px] font-titillium ${errors.pincode ? 'border-[#d92d20] border-[1.5px]' : 'border-[#eaebf0] border-[1px] focus:border-[#242424] focus:border-[1.5px]'}`}
                      />
                      {errors.pincode && <span className="text-[#d92d20] text-[11px] font-titillium mt-[2px] ml-[4px]">{errors.pincode}</span>}
                    </div>
                  </div>
                </div>

                {/* ADDRESS TYPE */}
                <div className="flex flex-col gap-[8px] mt-[8px]">
                  <span className="font-titillium font-semibold text-[#242424] text-[13px]">Save address as</span>
                  <div className="flex gap-[8px]">
                    {['Home', 'Work', 'Other'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setFormData({ ...formData, type: type as any })}
                        className={`px-[16px] py-[6px] border rounded-[6px] font-titillium text-[13px] font-medium transition-colors ${formData.type === type ? 'border-[#308026] bg-[#308026] text-white shadow-sm' : 'border-[#eaebf0] text-[#838383] bg-white hover:bg-[#fafbfb]'
                          }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-[16px] flex gap-[12px] sticky bottom-0 bg-white pt-[8px]">
                  <button
                    disabled={isSaving || isDeleting}
                    className="flex-1 h-[52px] bg-[#ffe900] active:scale-[0.98] transition-transform rounded-[12px] font-titillium font-bold text-[16px] disabled:opacity-50"
                    onClick={handleSave}
                  >
                    {isSaving ? "Saving..." : "Save Address"}
                  </button>
                </div>
              </div>
            ) : (
              // FULLSCREEN MAP VIEW
              <div className="flex flex-col w-full h-full px-[24px] pb-[32px]">
                <div className="flex flex-col mb-[16px] min-h-[48px]">
                  <h2 className="font-titillium text-[20px] font-bold text-[#242424]">Select Location</h2>
                  <p className="font-titillium text-[14px] text-[#838383]">Tap anywhere on the map to drop a pin.</p>
                </div>

                <div className="flex-1 w-full min-h-0 mb-[16px] z-[1]">
                  <MapSelector
                    defaultLat={tempLat}
                    defaultLng={tempLng}
                    onLocationSelect={(lat, lng) => {
                      setTempLat(lat);
                      setTempLng(lng);
                    }}
                  />
                </div>

                <div className="flex gap-[12px] shrink-0 mt-auto">
                  <button
                    onClick={() => setIsMapFullscreen(false)}
                    className="flex-1 h-[52px] rounded-[12px] border border-[#eaebf0] font-titillium font-bold text-[16px] text-[#242424] active:scale-95 transition-transform"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmLocation}
                    disabled={isGeocoding}
                    className="flex-[2] h-[52px] rounded-[12px] bg-[#242424] text-white font-titillium font-bold text-[16px] active:scale-95 transition-transform disabled:opacity-70"
                  >
                    {isGeocoding ? "Locating..." : "Confirm Location"}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddressModal;