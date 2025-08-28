import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { User, Mail, Calendar } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

export default function Show() {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const user = auth.user;
    return (
        <AppLayout title="Profile">
            <Head title="Profile" />
            
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Profile</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account information</p>
                    </div>

                    {/* Profile Content */}
                    <div className="px-6 py-6">
                        <div className="space-y-6">
                            {/* Profile Avatar */}
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full">
                                    <User className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-medium text-gray-900 dark:text-white">{user.name}</h2>
                                    <p className="text-gray-500 dark:text-gray-400">User Account</p>
                                </div>
                            </div>

                            {/* Profile Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <User className="w-4 h-4 mr-2" />
                                        Full Name
                                    </label>
                                    <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                                        <p className="text-gray-900 dark:text-white">{user.name}</p>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <Mail className="w-4 h-4 mr-2" />
                                        Email Address
                                    </label>
                                    <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                                        <p className="text-gray-900 dark:text-white">{user.email}</p>
                                    </div>
                                </div>

                                {/* Member Since */}
                                <div className="space-y-2">
                                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Member Since
                                    </label>
                                    <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                                        <p className="text-gray-900 dark:text-white">
                                            {new Date(user.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}