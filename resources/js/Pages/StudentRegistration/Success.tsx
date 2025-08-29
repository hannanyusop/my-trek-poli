import { Head } from '@inertiajs/react';

interface RegistrationSession {
    id: number;
    name: string;
    description: string;
    link_token: string;
    start_date: string;
    end_date: string;
    status: 'draft' | 'open' | 'closed' | 'placement' | 'published';
}

interface Student {
    id: number;
    matric_number: string;
    name: string;
    email: string;
    submitted_at: string;
}

interface TrackPreference {
    id: number;
    priority: number;
    registration_session_track: {
        id: number;
        track: {
            id: number;
            name: string;
            description: string;
        };
    };
}

interface Placement {
    id: number;
    class: {
        id: number;
        name: string;
        registration_session_track: {
            track: {
                id: number;
                name: string;
                description: string;
            };
        };
    };
    assigned_at: string;
}

interface Props {
    registrationSession: RegistrationSession;
    student: Student;
    preferences: TrackPreference[];
    placement: Placement | null;
}

export default function Success({ registrationSession, student, preferences, placement }: Props) {
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

                    {/* Track Preferences */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Track Preferences</h2>
                        
                        <div className="space-y-3">
                            {preferences.map((preference) => (
                                <div key={preference.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <span className="inline-flex items-center justify-center w-6 h-6 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-sm font-semibold rounded-full">
                                            {preference.priority}
                                        </span>
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                                                {preference.registration_session_track.track.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {preference.registration_session_track.track.description}
                                            </p>
                                        </div>
                                    </div>
                                    {preference.priority === 1 && (
                                        <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 dark:bg-green-900/20 dark:text-green-400 rounded-full">
                                            1st Choice
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Results Status */}
                    <div className="mb-6">
                        {registrationSession.status === 'published' ? (
                            /* Assignment Result (when published) */
                            placement ? (
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <svg className="h-6 w-6 text-green-600 dark:text-green-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">Class Assignment</h3>
                                            <div className="bg-white dark:bg-green-900/40 rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-medium text-green-900 dark:text-green-100">
                                                            {placement.class.registration_session_track.track.name}
                                                        </h4>
                                                        <p className="text-sm text-green-700 dark:text-green-300">
                                                            Class: {placement.class.name}
                                                        </p>
                                                    </div>
                                                    <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-200 dark:bg-green-800 dark:text-green-200 rounded-full">
                                                        Assigned
                                                    </span>
                                                </div>
                                                <p className="text-sm text-green-600 dark:text-green-400">
                                                    Assigned on: {formatDate(placement.assigned_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">No Assignment Yet</h3>
                                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                                Results have been published but you haven't been assigned to a class yet. Please contact the administration office for assistance.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        ) : (
                            /* Results Still in Process */
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-300 border-t-blue-600 dark:border-blue-700 dark:border-t-blue-400 mt-1"></div>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">Results Still in Process</h3>
                                        <div className="bg-white dark:bg-blue-900/40 rounded-lg p-4">
                                            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                                                Your registration has been successfully submitted and your preferences have been recorded. 
                                                The results are currently being processed and class assignments are not yet finalized.
                                            </p>
                                            <div className="flex items-center space-x-2">
                                                <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                                                    registrationSession.status === 'placement' 
                                                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300'
                                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                                                }`}>
                                                    Status: {registrationSession.status.charAt(0).toUpperCase() + registrationSession.status.slice(1)}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-3">
                                            <span className="font-medium">Please check back later</span> or watch your email for updates on class assignments.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
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
                                    {registrationSession.status === 'published' ? (
                                        <ul className="list-disc list-inside space-y-1">
                                            {placement ? (
                                                <>
                                                    <li>You have been assigned to your class</li>
                                                    <li>Attend your assigned track sessions</li>
                                                    <li>Check your email for further instructions</li>
                                                </>
                                            ) : (
                                                <>
                                                    <li>Results have been published</li>
                                                    <li>Contact administration for assignment details</li>
                                                    <li>Check back later or contact support</li>
                                                </>
                                            )}
                                        </ul>
                                    ) : registrationSession.status === 'placement' ? (
                                        <ul className="list-disc list-inside space-y-1">
                                            <li>Your preferences are being processed</li>
                                            <li>Class placements are being finalized</li>
                                            <li>Results will be available soon</li>
                                        </ul>
                                    ) : (
                                        <ul className="list-disc list-inside space-y-1">
                                            <li>Your track preferences have been recorded</li>
                                            <li>You will be notified about class placement</li>
                                            <li>Check your email regularly for updates</li>
                                        </ul>
                                    )}
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