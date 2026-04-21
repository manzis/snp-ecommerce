'use client';

import React from 'react';
import UnderConstruction from '@/components/shared/UnderConstruction';

export default function NotFound() {
  return (
    <UnderConstruction 
      title="Oops! Page Not Found"
      message="The page you're looking for doesn't exist or is currently being overhauled by our engineering team. It will be back soon!"
    />
  );
}
