import { FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';

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

interface Student {
    id: number;
    matric_number: string;
    identification_number?: string;
    name?: string;
    gender?: 'male' | 'female';
    race?: string;
    religion?: string;
    email?: string;
    phone?: string;
}

interface Track {
    id: number;
    registration_session_id: number;
    track_id: number;
    name: string;
    description: string;
    track: {
        id: number;
        name: string;
        description: string;
    };
}

interface Props {
    registrationSession: RegistrationSession;
    student: Student | null;
    tracks: Track[];
}

export default function Form({ registrationSession, student, tracks }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        matric_number: student?.matric_number || '',
        identification_number: student?.identification_number || '',
        name: student?.name || '',
        gender: student?.gender || '',
        race: student?.race || '',
        religion: student?.religion || '',
        email: student?.email || '',
        phone: student?.phone || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('student.registration.store.student', registrationSession.link_token));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <Head title={`Student Information - ${registrationSession.name}`} />

            <div className="max-w-2xl mx-auto">
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl px-8 py-10 border border-gray-100 dark:border-gray-700">
                    <div className="text-center mb-8">
                        <div className="mx-auto h-16 w-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mb-4">
                            <svg className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Student Information
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            {student ? 'Update your information and proceed to track selection' : 'Please provide your information to continue'}
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={submit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="matric_number" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Matric Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="matric_number"
                                    name="matric_number"
                                    type="text"
                                    readOnly
                                    className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white cursor-not-allowed"
                                    value={data.matric_number}
                                />
                            </div>

                            <div>
                                <label htmlFor="identification_number" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    IC/Passport Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="identification_number"
                                    name="identification_number"
                                    type="text"
                                    required
                                    className={`block w-full px-4 py-3 border rounded-lg transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                                        errors.identification_number
                                            ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}
                                    placeholder="Enter your IC or passport number"
                                    value={data.identification_number}
                                    onChange={(e) => setData('identification_number', e.target.value)}
                                />
                                {errors.identification_number && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.identification_number}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    className={`block w-full px-4 py-3 border rounded-lg transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                                        errors.name
                                            ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}
                                    placeholder="Enter your full name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                {errors.name && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Gender <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="gender"
                                    name="gender"
                                    required
                                    className={`block w-full px-4 py-3 border rounded-lg transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                                        errors.gender
                                            ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}
                                    value={data.gender}
                                    onChange={(e) => setData('gender', e.target.value as 'male' | 'female' | '')}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                                {errors.gender && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.gender}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="race" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Race <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="race"
                                    name="race"
                                    type="text"
                                    required
                                    className={`block w-full px-4 py-3 border rounded-lg transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                                        errors.race
                                            ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}
                                    placeholder="Enter your race"
                                    value={data.race}
                                    onChange={(e) => setData('race', e.target.value)}
                                />
                                {errors.race && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.race}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="religion" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Religion <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="religion"
                                    name="religion"
                                    type="text"
                                    required
                                    className={`block w-full px-4 py-3 border rounded-lg transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                                        errors.religion
                                            ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}
                                    placeholder="Enter your religion"
                                    value={data.religion}
                                    onChange={(e) => setData('religion', e.target.value)}
                                />
                                {errors.religion && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.religion}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className={`block w-full px-4 py-3 border rounded-lg transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                                        errors.email
                                            ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}
                                    placeholder="Enter your email address"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    required
                                    className={`block w-full px-4 py-3 border rounded-lg transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                                        errors.phone
                                            ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}
                                    placeholder="Enter your phone number"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                />
                                {errors.phone && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
                                )}
                            </div>
                        </div>

                        <div className="pt-6">
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
                                {processing ? 'Saving...' : 'Next: Select Tracks'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}