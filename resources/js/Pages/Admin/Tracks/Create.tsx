import { Head, Link } from '@inertiajs/react';
import { Form } from '@inertiajs/react';
import { toast } from 'react-toastify';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowLeft, Plus, BookOpen } from 'lucide-react';

export default function Create() {
    return (
        <AppLayout>
            <Head title="Create Track" />
            
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center mb-4">
                                        <Link
                                            href={route('admin.tracks.index')}
                                            className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-4"
                                        >
                                            <ArrowLeft className="h-5 w-5 mr-1" />
                                            Back to Tracks
                                        </Link>
                                    </div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                                        <BookOpen className="mr-3 h-8 w-8" />
                                        Create New Track
                                    </h1>
                                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                                        Add a new academic track to the system
                                    </p>
                                </div>
                            </div>

                            <div className="max-w-2xl">
                                <Form 
                                    action={route('admin.tracks.store')} 
                                    method="post"
                                    className="space-y-6"
                                    onError={(errors) => {
                                        Object.values(errors).forEach((error) => {
                                            if (typeof error === 'string') {
                                                toast.error(error);
                                            }
                                        });
                                    }}
                                >
                                    {({ errors, processing }) => (
                                        <>
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Track Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    placeholder="Enter track name"
                                                />
                                                {errors.name && (
                                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                        {errors.name}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Description
                                                </label>
                                                <textarea
                                                    id="description"
                                                    name="description"
                                                    rows={4}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    placeholder="Enter track description"
                                                />
                                                {errors.description && (
                                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                        {errors.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center">
                                                <input type="hidden" name="is_active" value="0" />
                                                <input
                                                    type="checkbox"
                                                    id="is_active"
                                                    name="is_active"
                                                    value="1"
                                                    defaultChecked
                                                    className="h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500"
                                                />
                                                <label htmlFor="is_active" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                    Active (track is available for registration)
                                                </label>
                                            </div>

                                            <div className="flex items-center justify-end space-x-4">
                                                <Link
                                                    href={route('admin.tracks.index')}
                                                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors"
                                                >
                                                    Cancel
                                                </Link>
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {processing ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                                            Creating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Plus className="mr-2 h-4 w-4" />
                                                            Create Track
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </Form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}