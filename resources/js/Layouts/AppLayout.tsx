import { PropsWithChildren, useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { ToastContainer, toast } from 'react-toastify';
import Sidebar from '@/Components/Sidebar';
import TopBar from '@/Components/TopBar';
import 'react-toastify/dist/ReactToastify.css';

interface User {
    id: number;
    name: string;
    email: string;
}

export default function AppLayout({ 
    children, 
    title 
}: PropsWithChildren<{ title?: string }>) {
    const { auth, flash } = usePage<{ 
        auth?: { user: User }, 
        flash?: { success?: string, error?: string } 
    }>().props;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Close mobile menu when screen becomes larger
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Head title={title} />
            
            <div className="flex h-screen">
                {/* Desktop Sidebar */}
                <div className={`hidden lg:flex transition-all duration-300 ${isSidebarCollapsed ? 'w-16' : 'w-64'}`}>
                    <Sidebar user={auth?.user} isCollapsed={isSidebarCollapsed} />
                </div>

                {/* Mobile Sidebar Overlay */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        {/* Backdrop */}
                        <div 
                            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        
                        {/* Sidebar */}
                        <div className="fixed inset-y-0 left-0 w-64 transform transition-transform duration-300 ease-in-out">
                            <Sidebar user={auth?.user} onClose={() => setIsMobileMenuOpen(false)} />
                        </div>
                    </div>
                )}
                
                {/* Main content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Top bar */}
                    <TopBar 
                        user={auth?.user} 
                        title={title} 
                        onMenuClick={() => setIsMobileMenuOpen(true)}
                        onSidebarToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        isSidebarCollapsed={isSidebarCollapsed}
                    />
                    
                    <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
                        {children}
                    </main>
                </div>
            </div>
            
            {/* Toast Container */}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                className="mt-16"
            />
        </div>
    );
}