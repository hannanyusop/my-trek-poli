import { PropsWithChildren } from 'react';
import { Head, usePage } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';

interface User {
    id: number;
    name: string;
    email: string;
}

export default function AppLayout({ 
    children, 
    title 
}: PropsWithChildren<{ title?: string }>) {
    const { auth } = usePage<{ auth?: { user: User } }>().props;
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Head title={title} />
            
            <div className="flex h-screen">
                {/* Sidebar */}
                <Sidebar user={auth?.user} />
                
                {/* Main content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}