import { PropsWithChildren } from 'react';
import { Head } from '@inertiajs/react';

export default function AppLayout({ 
    children, 
    title 
}: PropsWithChildren<{ title?: string }>) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Head title={title} />
            
            <nav className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <h1 className="text-xl font-bold text-gray-900">
                                    Laravel React
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}