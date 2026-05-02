import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ClientAccountPage from '@/components/account/ClientAccountPage';

export default async function AccountPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // SERVER-SIDE REDIRECT: INSTANT & NO VISUAL GLITCHES
    if (!user) {
        redirect('/login?redirect=/account');
    }

    return <ClientAccountPage user={user} />;
}
