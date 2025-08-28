import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function SemesterRegistration() {
    return (
        <AppLayout>
            <Head title="Semester Registration" />
            
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    Semester Registration
                                </h1>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    Register for courses and manage your semester enrollment
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                        Available Courses
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Course registration functionality will be implemented here.
                                    </p>
                                </div>

                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                        Current Enrollment
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        View your currently enrolled courses and schedule.
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