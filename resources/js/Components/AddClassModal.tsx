import { useState } from 'react';
import { Form } from '@inertiajs/react';
import { X, BookOpen, Plus } from 'lucide-react';
import { RegistrationSessionTrack } from '@/types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    sessionId: number;
    availableTracks: RegistrationSessionTrack[];
}

export default function AddClassModal({ isOpen, onClose, sessionId, availableTracks }: Props) {
    const [trackId, setTrackId] = useState('');
    const [name, setName] = useState('');
    const [quota, setQuota] = useState(30);

    if (!isOpen) return null;

    const handleSuccess = () => {
        setTrackId('');
        setName('');
        setQuota(30);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 sm:mx-0 sm:h-10 sm:w-10">
                                <BookOpen className="h-6 w-6 text-green-600 dark:text-green-300" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                                    Add New Class
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Add a new class to an existing track in this session.
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
                                action={route('admin.registration-sessions.add-class', sessionId)}
                                method="post"
                                onSuccess={handleSuccess}
                                resetOnError={false}
                                resetOnSuccess={true}
                            >
                                {({ errors, processing }) => (
                                    <>
                                        <div className="mb-4">
                                            <label htmlFor="registration_session_track_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Track
                                            </label>
                                            <select
                                                id="registration_session_track_id"
                                                name="registration_session_track_id"
                                                value={trackId}
                                                onChange={(e) => setTrackId(e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                                                required
                                            >
                                                <option value="">Select a track</option>
                                                {availableTracks.map((sessionTrack) => (
                                                    <option key={sessionTrack.id} value={sessionTrack.id}>
                                                        {sessionTrack.track.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.registration_session_track_id && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.registration_session_track_id}</p>
                                            )}
                                        </div>

                                        <div className="mb-4">
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Class Name
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                                                placeholder="Enter class name"
                                                required
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                                            )}
                                        </div>

                                        <div className="mb-4">
                                            <label htmlFor="quota" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Quota
                                            </label>
                                            <input
                                                type="number"
                                                id="quota"
                                                name="quota"
                                                value={quota}
                                                onChange={(e) => setQuota(parseInt(e.target.value) || 1)}
                                                min="1"
                                                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                                                placeholder="Enter quota"
                                                required
                                            />
                                            {errors.quota && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.quota}</p>
                                            )}
                                        </div>

                                        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg -mx-4 -mb-4 sm:-mx-6 sm:-mb-4">
                                            <button
                                                type="submit"
                                                disabled={processing || !name.trim() || !trackId}
                                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {processing ? (
                                                    <>
                                                        <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                                        Adding...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Add Class
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                disabled={processing}
                                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
