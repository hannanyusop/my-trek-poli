import { FormEventHandler } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { RegistrationSession, Student } from '@/types';
import StepIndicator from '@/Components/StepIndicator';

declare global {
    function route(name?: string, params?: any, absolute?: boolean): string;
}

interface StudentPreference {
    id: number;
    priority: number;
    registration_session_track: {
        id: number;
        name: string;
        track: {
            name: string;
            description: string;
        };
    };
}

interface Props {
    registrationSession: RegistrationSession;
    student: Student;
    preferences: StudentPreference[];
}

export default function Preview({ registrationSession, student, preferences }: Props) {
    const { post, processing } = useForm();

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('student.registration.submit', registrationSession.link_token));
    };

    const handleBackToTracks = () => {
        router.visit(route('student.registration.tracks', registrationSession.link_token));
    };

    const handleBackToForm = () => {
        router.visit(route('student.registration.form', registrationSession.link_token));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <Head title={`Registration Preview - ${registrationSession.name}`} />

            <div className="max-w-4xl mx-auto">
                <StepIndicator currentStep={2} className="mb-12" />
                
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl px-8 py-10 border border-gray-100 dark:border-gray-700">
                    <div className="text-center mb-8">
                        <div className="mx-auto h-16 w-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                            <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Registration Preview
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Review your information and track preferences before submitting
                        </p>
                    </div>

                    <form onSubmit={submit}>
                        <div className="space-y-8">
                            {/* Student Information Card */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                                <div className="flex items-center mb-6">
                                    <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                                        <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            Student Information
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Personal details and contact information
                                        </p>
                                    </div>
                                    <div className="ml-auto">
                                        <button
                                            type="button"
                                            onClick={handleBackToForm}
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                                        >
                                            Edit Information
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div>
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Matric Number</span>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{student.matric_number}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Full Name</span>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{student.name}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">IC/Passport Number</span>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{student.identification_number}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Gender</span>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1 capitalize">{student.gender}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Race</span>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{student.race}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Religion</span>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{student.religion}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email Address</span>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{student.email}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Phone Number</span>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{student.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Track Preferences Card */}
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
                                <div className="flex items-center mb-6">
                                    <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-3">
                                        <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            Track Preferences
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Your prioritized track selection ({preferences.length} tracks)
                                        </p>
                                    </div>
                                    <div className="ml-auto">
                                        <button
                                            type="button"
                                            onClick={handleBackToTracks}
                                            className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
                                        >
                                            Edit Preferences
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                                    <div className="space-y-4">
                                        {preferences.map((preference, index) => (
                                            <div key={preference.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-bold rounded-full">
                                                    {preference.priority}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        {preference.registration_session_track.name}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        {preference.registration_session_track.track.description}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    {index === 0 && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                                            Top Choice
                                                        </span>
                                                    )}
                                                    {index === 1 && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                                                            2nd Choice
                                                        </span>
                                                    )}
                                                    {index === 2 && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                                                            3rd Choice
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Registration Session Details */}
                            <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                                <div className="flex items-center mb-4">
                                    <div className="h-8 w-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                                        <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 4v6m-2-6h4m-4 0H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Registration Session
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Session details and timeline
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{registrationSession.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{registrationSession.description}</p>
                                    <div className="flex items-center space-x-6 text-xs text-gray-500 dark:text-gray-400">
                                        <div>
                                            <span className="font-medium">Start Date:</span> {new Date(registrationSession.start_date).toLocaleDateString()}
                                        </div>
                                        <div>
                                            <span className="font-medium">End Date:</span> {new Date(registrationSession.end_date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Final Confirmation */}
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-700">
                                <div className="flex items-start space-x-3">
                                    <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.536 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <div>
                                        <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                                            Final Confirmation
                                        </h3>
                                        <div className="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
                                            <p>• All information above is correct and complete</p>
                                            <p>• Track preferences are listed in order of priority</p>
                                            <p>• You understand that preferences cannot be changed after submission</p>
                                            <p>• Registration will be processed according to availability and your preferences</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-10 flex gap-4">
                            <button
                                type="button"
                                onClick={handleBackToTracks}
                                className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                <svg className="h-4 w-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to Track Selection
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className={`flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                                    processing
                                        ? 'bg-green-400 dark:bg-green-500 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 transform hover:scale-105 active:scale-95'
                                }`}
                            >
                                {processing && (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {processing ? 'Submitting Registration...' : 'Submit Registration'}
                                <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}