import { useState } from 'react';
import { Form } from '@inertiajs/react';
import { X, User, Plus } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    sessionId: number;
}

export default function AddSingleStudentModal({ isOpen, onClose, sessionId }: Props) {
    const [matricNumber, setMatricNumber] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 sm:mx-0 sm:h-10 sm:w-10">
                                <User className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                                    Add Single Student
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Enter the matric number to add a student to this registration session.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="mt-6">
                            <Form
                                action={route('admin.registration-sessions.add-student', sessionId)}
                                method="post"
                                onSuccess={() => {
                                    setMatricNumber('');
                                    onClose();
                                }}
                                resetOnError={false}
                                resetOnSuccess={true}
                            >
                                {({ errors, processing, wasSuccessful }) => (
                                    <>
                                        <div className="mb-4">
                                            <label htmlFor="matric_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Matric Number
                                            </label>
                                            <input
                                                type="text"
                                                id="matric_number"
                                                name="matric_number"
                                                value={matricNumber}
                                                onChange={(e) => setMatricNumber(e.target.value.toUpperCase())}
                                                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm uppercase"
                                                placeholder="Enter matric number"
                                                required
                                            />
                                            {errors.matric_number && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.matric_number}</p>
                                            )}
                                        </div>

                                        {wasSuccessful && (
                                            <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-md">
                                                <p className="text-sm text-green-700 dark:text-green-300">
                                                    Student added successfully!
                                                </p>
                                            </div>
                                        )}

                                        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                            <button
                                                type="submit"
                                                disabled={processing || !matricNumber.trim()}
                                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {processing ? (
                                                    <>
                                                        <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                                        Adding...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Add Student
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                disabled={processing}
                                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                            >
                                                Cancel
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
    );
}
