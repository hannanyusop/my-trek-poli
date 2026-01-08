import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { X, User, Save } from 'lucide-react';
import { Student } from '@/types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    sessionId: number;
    student: Student | null;
}

export default function EditStudentModal({ isOpen, onClose, sessionId, student }: Props) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: '',
        matric_number: '',
        identification_number: '',
        gender: '',
        race: '',
        religion: '',
        email: '',
        phone: '',
    });

    useEffect(() => {
        if (student) {
            setData({
                name: student.name || '',
                matric_number: student.matric_number || '',
                identification_number: student.identification_number || '',
                gender: student.gender || '',
                race: student.race || '',
                religion: student.religion || '',
                email: student.email || '',
                phone: student.phone || '',
            });
        }
    }, [student]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!student) return;

        put(route('admin.registration-sessions.update-student', [sessionId, student.id]), {
            onSuccess: () => {
                onClose();
            },
        });
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!isOpen || !student) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                    aria-hidden="true"
                    onClick={handleClose}
                ></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 sm:mx-0 sm:h-10 sm:w-10">
                                    <User className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                                        Edit Student Details
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Update the student information below.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="mt-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                                            required
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="matric_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Matric Number <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="matric_number"
                                            value={data.matric_number}
                                            onChange={(e) => setData('matric_number', e.target.value.toUpperCase())}
                                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm uppercase"
                                            required
                                        />
                                        {errors.matric_number && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.matric_number}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="identification_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Identification Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="identification_number"
                                        value={data.identification_number}
                                        onChange={(e) => setData('identification_number', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                                        required
                                    />
                                    {errors.identification_number && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.identification_number}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Gender <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="gender"
                                            value={data.gender}
                                            onChange={(e) => setData('gender', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                                            required
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                        {errors.gender && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.gender}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="race" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Race <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="race"
                                            value={data.race}
                                            onChange={(e) => setData('race', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                                            required
                                        />
                                        {errors.race && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.race}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="religion" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Religion <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="religion"
                                        value={data.religion}
                                        onChange={(e) => setData('religion', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                                        required
                                    />
                                    {errors.religion && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.religion}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Phone
                                        </label>
                                        <input
                                            type="text"
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                                        />
                                        {errors.phone && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={processing}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
