import { FormEventHandler, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import toast, { Toaster } from 'react-hot-toast';
import { RegistrationSession, Student, Track, Race, Religion } from '@/types';
import StepIndicator from '@/Components/StepIndicator';

declare global {
    function route(name?: string, params?: any, absolute?: boolean): string;
}

interface Props {
    registrationSession: RegistrationSession;
    student: Student | null;
    tracks: Track[];
    races: Race[];
    religions: Religion[];
}

export default function Form({ registrationSession, student, tracks, races, religions }: Props) {
    const storageKey = `student_data_${registrationSession.link_token}`;
    
    // Load data from localStorage or use provided student data
    const getInitialData = () => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch (e) {
                    localStorage.removeItem(storageKey);
                }
            }
        }
        return {
            matric_number: student?.matric_number || '',
            identification_number: student?.identification_number || '',
            name: student?.name || '',
            gender: student?.gender || '',
            race: student?.race || '',
            religion: student?.religion || '',
            email: student?.email || '',
            phone: student?.phone || '',
        };
    };

    const { data, setData, post, processing, errors } = useForm(getInitialData());

    // Check if localStorage has meaningful data, redirect to registration page if not
    useEffect(() => {
        if (typeof window !== 'undefined' && !student) {
            const stored = localStorage.getItem(storageKey);
            if (!stored) {
                router.visit(route('student.registration.show', registrationSession.link_token));
                return;
            }
            try {
                const studentData = JSON.parse(stored);
                if (!studentData.matric_number) {
                    localStorage.removeItem(storageKey);
                    router.visit(route('student.registration.show', registrationSession.link_token));
                    return;
                }
            } catch (e) {
                localStorage.removeItem(storageKey);
                router.visit(route('student.registration.show', registrationSession.link_token));
                return;
            }
        }
    }, [student, storageKey, registrationSession.link_token]);

    // Update form data when student is found via lookup
    useEffect(() => {
        if (student && typeof window !== 'undefined') {
            const studentData = {
                matric_number: student.matric_number || '',
                identification_number: student.identification_number || '',
                name: student.name || '',
                gender: student.gender || '',
                race: student.race || '',
                religion: student.religion || '',
                email: student.email || '',
                phone: student.phone || '',
            };
            localStorage.setItem(storageKey, JSON.stringify(studentData));
            
            // Update form data with student info
            setData({
                matric_number: studentData.matric_number,
                identification_number: studentData.identification_number,
                name: studentData.name,
                gender: studentData.gender,
                race: studentData.race,
                religion: studentData.religion,
                email: studentData.email,
                phone: studentData.phone,
            });
        }
    }, [student, storageKey]);

    // Save form data to localStorage whenever it changes (only if there's meaningful data)
    useEffect(() => {
        if (typeof window !== 'undefined' && (data.matric_number || data.name || data.email)) {
            localStorage.setItem(storageKey, JSON.stringify(data));
        }
    }, [data, storageKey]);

    // Show toast notifications for validation errors
    useEffect(() => {
        const errorKeys = Object.keys(errors);
        if (errorKeys.length > 0) {
            errorKeys.forEach((field) => {
                const message = errors[field as keyof typeof errors];
                const errorMessage = Array.isArray(message) ? message[0] : message;
                if (field === 'matric_number') {
                    toast.error('Student lookup failed: ' + errorMessage);
                } else {
                    toast.error(`${field.replace('_', ' ')}: ${errorMessage}`);
                }
            });
        }
    }, [errors]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('student.registration.store.student', registrationSession.link_token));
    };

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(storageKey);
            localStorage.removeItem(`student_submitted_${registrationSession.link_token}`);
        }
        router.visit(route('student.registration.show', registrationSession.link_token));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <Head title={`Student Information - ${registrationSession.name}`} />
            <Toaster position="top-right" />

            <div className="max-w-4xl mx-auto">
                <StepIndicator currentStep={0} className="mb-12" />
                
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl px-8 py-10 border border-gray-100 dark:border-gray-700">
                    <div className="text-center mb-8">
                        <div className="mx-auto h-16 w-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mb-4">
                            <svg className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex-1"></div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Student Information
                            </h1>
                            <div className="flex-1 flex justify-end">
                                {(student || data.matric_number) && (
                                    <button
                                        onClick={handleLogout}
                                        className="text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                        title="Clear student data and start over"
                                    >
                                        Clear & Start Over
                                    </button>
                                )}
                            </div>
                        </div>
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
                                    required
                                    className={`block w-full px-4 py-2.5 border rounded-lg transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                                        errors.matric_number
                                            ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}
                                    placeholder="Enter your matric number (e.g., A123456)"
                                    value={data.matric_number}
                                    onChange={(e) => setData('matric_number', e.target.value.toUpperCase())}
                                />
                                {errors.matric_number && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.matric_number}</p>
                                )}
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
                                    className={`block w-full px-4 py-2.5 border rounded-lg transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
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
                                    className={`block w-full px-4 py-3.5 border rounded-lg transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
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
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Gender <span className="text-red-500">*</span>
                                </label>
                                <RadioGroup
                                    value={data.gender}
                                    onValueChange={(value) => setData('gender', value as 'male' | 'female' | '')}
                                    className="flex gap-6"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="male"
                                            id="male"
                                            className={errors.gender ? 'border-red-300 dark:border-red-600' : ''}
                                        />
                                        <Label
                                            htmlFor="male"
                                            className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                                        >
                                            Male
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="female"
                                            id="female"
                                            className={errors.gender ? 'border-red-300 dark:border-red-600' : ''}
                                        />
                                        <Label
                                            htmlFor="female"
                                            className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                                        >
                                            Female
                                        </Label>
                                    </div>
                                </RadioGroup>
                                {errors.gender && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.gender}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="race" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Race <span className="text-red-500">*</span>
                                </label>
                                <Select value={data.race} onValueChange={(value) => setData('race', value)}>
                                    <SelectTrigger className={`w-full px-4 py-2.5 h-auto ${
                                        errors.race
                                            ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}>
                                        <SelectValue placeholder="Select Race" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {races.map((race) => (
                                            <SelectItem key={race.id} value={race.name}>
                                                {race.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.race && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.race}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="religion" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Religion <span className="text-red-500">*</span>
                                </label>
                                <Select value={data.religion} onValueChange={(value) => setData('religion', value)}>
                                    <SelectTrigger className={`w-full px-4 py-3.5 h-auto ${
                                        errors.religion
                                            ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}>
                                        <SelectValue placeholder="Select Religion" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {religions.map((religion) => (
                                            <SelectItem key={religion.id} value={religion.name}>
                                                {religion.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                                    className={`block w-full px-4 py-2 border rounded-lg transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
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
                                    className={`block w-full px-4 py-2.5 border rounded-lg transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
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

                        <div className="pt-6 flex gap-4">
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Clear Form
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className={`flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                    processing
                                        ? 'bg-indigo-400 dark:bg-indigo-500 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 transform hover:scale-105 active:scale-95'
                                }`}
                            >
                                {processing && (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 812-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {processing ? 'Saving...' : 'Next: Select Tracks'}
                                <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
