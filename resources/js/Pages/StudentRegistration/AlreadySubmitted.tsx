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
    is_submitted: boolean;
}

interface Props {
    registrationSession: RegistrationSession;
    student: Student;
}

export default function AlreadySubmitted({ registrationSession, student }: Props) {
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <Head title={`Already Registered - ${registrationSession.name}`} />

            <div className="max-w-lg w-full">
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl px-8 py-10 border border-gray-100 dark:border-gray-700 text-center">
                    {/* Warning Icon */}
                    <div className="mx-auto h-20 w-20 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mb-6">
                        <svg className="h-10 w-10 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>

                    {/* Already Submitted Message */}
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Already Registered
                    </h1>
                    
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                        Hello <span className="font-semibold text-amber-600 dark:text-amber-400">{student.name}</span>, you have already completed your registration for this session.
                    </p>

                    {/* Registration Details */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8 text-left">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Registration Details</h2>
                        
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
                            
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    <svg className="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 8 8">
                                        <circle cx={4} cy={4} r={3} />
                                    </svg>
                                    Completed
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Information Box */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400 mt-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3 text-left">
                                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Registration Status</h3>
                                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Your track preferences have been saved</li>
                                        <li>No further action is required</li>
                                        <li>You will be notified about class placement</li>
                                        <li>Contact administration for any changes</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            <span>Need to make changes?</span>
                        </div>
                        
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            Contact the administration office if you need to modify your registration or have any questions about your track selection.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}