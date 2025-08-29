import { Head } from '@inertiajs/react';

interface RegistrationSession {
    id: number;
    name: string;
    description: string;
    link_token: string;
    start_date: string;
    end_date: string;
}

interface Student {
    id: number;
    matric_number: string;
    name: string;
    email: string;
    submitted_at: string;
}

interface Props {
    registrationSession: RegistrationSession;
    student: Student;
}

export default function Success({ registrationSession, student }: Props) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-MY', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <Head title={`Registration Complete - ${registrationSession.name}`} />

            <div className="max-w-lg w-full">
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl px-8 py-10 border border-gray-100 dark:border-gray-700 text-center">
                    {/* Success Icon */}
                    <div className="mx-auto h-20 w-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6">
                        <svg className="h-10 w-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    {/* Success Message */}
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Registration Complete!
                    </h1>
                    
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                        Thank you for registering, <span className="font-semibold text-green-600 dark:text-green-400">{student.name}</span>!
                    </p>

                    {/* Registration Details */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8 text-left">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Registration Details</h2>
                        
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Session:</span>
                                <span className="text-sm text-gray-900 dark:text-white">{registrationSession.name}</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Matric Number:</span>
                                <span className="text-sm text-gray-900 dark:text-white font-mono">{student.matric_number}</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email:</span>
                                <span className="text-sm text-gray-900 dark:text-white">{student.email}</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted:</span>
                                <span className="text-sm text-gray-900 dark:text-white">{formatDate(student.submitted_at)}</span>
                            </div>
                        </div>
                    </div>

                    {/* What's Next */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400 mt-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3 text-left">
                                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">What's Next?</h3>
                                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Your track preferences have been recorded</li>
                                        <li>You will be notified about class placement</li>
                                        <li>Check your email regularly for updates</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <span>Your registration is secure and has been saved</span>
                        </div>

                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            Keep this confirmation for your records. If you have any questions, please contact the administration office.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}