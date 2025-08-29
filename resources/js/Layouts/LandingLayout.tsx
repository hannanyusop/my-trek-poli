import { PropsWithChildren, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface User {
    id: number;
    name: string;
    email: string;
}

export default function LandingLayout({ 
    children, 
    title 
}: PropsWithChildren<{ title?: string }>) {
    const { auth, flash } = usePage<{ 
        auth?: { user: User }, 
        flash?: { success?: string, error?: string } 
    }>().props;

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
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <Head title={title} />
            
            {/* Navigation Header */}
            <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center">
                                <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                    MyTrek
                                </h1>
                            </Link>
                        </div>

                        {/* Navigation Links */}
                        <nav className="hidden md:flex space-x-8">
                            <Link href="/" className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                                Home
                            </Link>
                            <Link href="/about" className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                                About
                            </Link>
                            <Link href="/contact" className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                                Contact
                            </Link>
                        </nav>

                        {/* Auth Links */}
                        <div className="flex items-center space-x-4">
                            {auth?.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">MyTrek</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Your journey management platform built with modern technology.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Product</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Features</Link></li>
                                <li><Link href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Pricing</Link></li>
                                <li><Link href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Documentation</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">About</Link></li>
                                <li><Link href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Blog</Link></li>
                                <li><Link href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Contact</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Privacy</Link></li>
                                <li><Link href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Terms</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                            © {new Date().getFullYear()} MyTrek. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
            
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
            />
        </div>
    );
}