import { FormEventHandler, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';

declare global {
    function route(name?: string, params?: any, absolute?: boolean): string;
}

interface RegistrationSession {
    id: number;
    name: string;
    description: string;
    link_token: string;
    start_date: string;
    end_date: string;
}

interface Props {
    registrationSession: RegistrationSession;
}

export default function Show({ registrationSession }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        matric_number: '',
    });

    const storageKey = `student_data_${registrationSession.link_token}`;

    // Check localStorage on page load and redirect if student data exists
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                try {
                    const studentData = JSON.parse(stored);
                    // Check if student has completed submission
                    const submissionKey = `student_submitted_${registrationSession.link_token}`;
                    const isSubmitted = localStorage.getItem(submissionKey) === 'true';
                    
                    if (isSubmitted && studentData.matric_number) {
                        // Redirect to summary page
                        router.visit(route('student.registration.summary', [
                            registrationSession.link_token,
                            studentData.matric_number
                        ]));
                    } else {
                        // Redirect to form page
                        router.visit(route('student.registration.lookup.form', registrationSession.link_token));
                    }
                } catch (e) {
                    // Invalid data, clear it
                    localStorage.removeItem(storageKey);
                }
            }
        }
    }, [registrationSession.link_token, storageKey]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('student.registration.lookup', registrationSession.link_token));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <Head title={`Student Registration - ${registrationSession.name}`} />

            <div className="max-w-lg w-full">
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl px-8 py-10 border border-gray-100 dark:border-gray-700">
                    <div className="text-center mb-8">
                        <div className="mx-auto h-16 w-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mb-4">
                            <svg className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Student Registration
                        </h1>
                        <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
                            {registrationSession.name}
                        </h2>
                        {registrationSession.description && (
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                {registrationSession.description}
                            </p>
                        )}
                    </div>

                    <form className="space-y-6" onSubmit={submit}>
                        <div>
                            <label htmlFor="matric_number" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Matric Number
                            </label>
                            <input
                                id="matric_number"
                                name="matric_number"
                                type="text"
                                autoComplete="off"
                                required
                                className={`block w-full px-4 py-3 border rounded-lg transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                                    errors.matric_number
                                        ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                }`}
                                placeholder="Enter your matric number (e.g., A123456)"
                                value={data.matric_number}
                                onChange={(e) => setData('matric_number', e.target.value.toUpperCase())}
                            />
                            {errors.matric_number && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.matric_number}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                processing
                                    ? 'bg-indigo-400 dark:bg-indigo-500 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 transform hover:scale-105 active:scale-95'
                            }`}
                        >
                            {processing && (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {processing ? 'Looking up...' : 'Continue'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <span>Your information is secure and protected</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}