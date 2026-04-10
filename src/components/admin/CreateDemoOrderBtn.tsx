'use client';

import { useState } from 'react';
import { createDemoOrderAction } from '@/app/actions/orderActions';
import { useRouter } from 'next/navigation';

export function CreateDemoOrderBtn() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    setLoading(true);
    try {
      const result = await createDemoOrderAction();
      if (result.success) {
        router.refresh();
      } else {
        alert(result.message || 'Failed to create demo order');
      }
    } catch (error) {
      alert('Error creating demo order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCreate}
      disabled={loading}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
    >
      {loading ? 'Creating...' : '+ Create Demo Order'}
    </button>
  );
}
