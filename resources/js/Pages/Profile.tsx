import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { User, Mail, Calendar, MapPin, Phone, Edit, Camera } from 'lucide-react';

export default function Profile() {
    return (
        <AppLayout>
            <Head title="Profile" />
            
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    Profile
                                </h1>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    Manage your account settings and personal information
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                                {/* Profile Picture & Basic Info */}
                                <div className="lg:col-span-1">
                                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                        <div className="text-center">
                                            <div className="relative inline-block">
                                                <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-full flex items-center justify-center text-2xl font-semibold mb-4 mx-auto">
                                                    U
                                                </div>
                                                <button className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors">
                                                    <Camera className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                User Name
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                Student
                                            </p>
                                            <button className="mt-4 flex items-center justify-center w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit Profile
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Details */}
                                <div className="lg:col-span-2">
                                    <div className="space-y-6">
                                        {/* Personal Information */}
                                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    Personal Information
                                                </h3>
                                                <button className="text-indigo-600 hover:text-indigo-700 transition-colors">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div className="flex items-center space-x-3">
                                                    <User className="h-5 w-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                                                        <p className="text-gray-900 dark:text-white">John Doe</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <Mail className="h-5 w-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                                        <p className="text-gray-900 dark:text-white">john.doe@example.com</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <Phone className="h-5 w-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                                                        <p className="text-gray-900 dark:text-white">+1 (555) 123-4567</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <Calendar className="h-5 w-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
                                                        <p className="text-gray-900 dark:text-white">January 1, 1990</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Academic Information */}
                                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    Academic Information
                                                </h3>
                                                <button className="text-indigo-600 hover:text-indigo-700 transition-colors">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Student ID</p>
                                                    <p className="text-gray-900 dark:text-white">STU001</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Track</p>
                                                    <p className="text-gray-900 dark:text-white">Computer Science</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Year</p>
                                                    <p className="text-gray-900 dark:text-white">3rd Year</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">GPA</p>
                                                    <p className="text-gray-900 dark:text-white">3.75</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Account Settings */}
                                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                Account Settings
                                            </h3>
                                            <div className="space-y-3">
                                                <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                    <p className="font-medium text-gray-900 dark:text-white">Change Password</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Update your account password</p>
                                                </button>
                                                <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                    <p className="font-medium text-gray-900 dark:text-white">Notification Preferences</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage email and push notifications</p>
                                                </button>
                                                <button className="w-full text-left px-4 py-3 rounded-lg border border-red-200 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                                    <p className="font-medium">Delete Account</p>
                                                    <p className="text-sm opacity-75">Permanently delete your account and data</p>
                                                </button>
                                            </div>
                                        </div>
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