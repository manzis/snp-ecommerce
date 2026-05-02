import { Metadata } from 'next';
import LoginModal from '@/components/auth/LoginModal';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Login | Supplyment Nepal',
    description: 'Login to your account to manage your fitness essentials, track orders, and access exclusive premium supplement deals in Nepal.',
    openGraph: {
        title: 'Login | Supplyment Nepal',
        description: 'Nepal\'s premium supplement store. Login to get started.',
        type: 'website',
    },
    robots: {
        index: false,
        follow: true,
    }
};

export default async function Page() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        redirect('/account');
    }

    return <LoginModal isPage={true} />;
}
