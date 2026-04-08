export async function reverseGeocode(lat: number, lng: number) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    const data = await res.json();
    
    if (data && data.address) {
      return {
        street: data.address.road || data.address.pedestrian || '',
        area: data.address.suburb || data.address.neighbourhood || data.address.residential || '',
        city: data.address.city || data.address.town || data.address.village || data.address.county || '',
        pincode: data.address.postcode || '',
        address_line_1: data.display_name || '',
      };
    }
  } catch (error) {
    console.error("Reverse geocoding failed", error);
  }
  return null;
}
