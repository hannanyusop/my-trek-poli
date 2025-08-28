import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Settings, Plus, Search, Edit, Trash2, BookOpen } from 'lucide-react';

export default function Tracks() {
    return (
        <AppLayout>
            <Head title="Tracks Management" />
            
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                                        <Settings className="mr-3 h-8 w-8" />
                                        Tracks Management
                                    </h1>
                                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                                        Manage academic tracks, courses, and curriculum
                                    </p>
                                </div>
                                
                                <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Track
                                </button>
                            </div>

                            <div className="mb-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search tracks..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <BookOpen className="h-8 w-8 text-indigo-600" />
                                        <div className="flex space-x-2">
                                            <button className="p-2 text-gray-500 hover:text-indigo-600 transition-colors">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button className="p-2 text-gray-500 hover:text-red-600 transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        Sample Track
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                        This is a placeholder track. Track management functionality will be implemented here.
                                    </p>
                                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                        <span>0 Courses</span>
                                        <span>Active</span>
                                    </div>
                                </div>

                                <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 flex items-center justify-center hover:border-indigo-400 transition-colors cursor-pointer">
                                    <div className="text-center">
                                        <Plus className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                            Add new track
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