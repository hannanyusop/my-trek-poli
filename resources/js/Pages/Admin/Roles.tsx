import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { UserCheck, Plus, Search, Shield, Users, Settings } from 'lucide-react';

export default function Roles() {
    return (
        <AppLayout>
            <Head title="Roles Management" />
            
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                                        <UserCheck className="mr-3 h-8 w-8" />
                                        Roles Management
                                    </h1>
                                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                                        Manage user roles and permissions across the system
                                    </p>
                                </div>
                                
                                <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Role
                                </button>
                            </div>

                            <div className="mb-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search roles..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                                            <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
                                        </div>
                                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                                            Active
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        Administrator
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                        Full system access with all permissions
                                    </p>
                                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center">
                                            <Users className="mr-1 h-4 w-4" />
                                            2 users
                                        </span>
                                        <span>All permissions</span>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                                            Active
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        Student
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                        Standard student access for course registration
                                    </p>
                                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center">
                                            <Users className="mr-1 h-4 w-4" />
                                            0 users
                                        </span>
                                        <span>Limited permissions</span>
                                    </div>
                                </div>

                                <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 flex items-center justify-center hover:border-indigo-400 transition-colors cursor-pointer">
                                    <div className="text-center">
                                        <Plus className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                            Create new role
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                    Permission Matrix
                                </h2>
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <p className="text-gray-600 dark:text-gray-400 text-center">
                                        Role permission matrix will be implemented here.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}