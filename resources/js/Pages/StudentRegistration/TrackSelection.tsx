import { FormEventHandler, useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { RegistrationSession, Student, Track } from '@/types';

declare global {
    function route(name?: string, params?: any, absolute?: boolean): string;
}

interface ExistingPreference {
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
    tracks: Track[];
    existingPreferences: ExistingPreference[];
}

export default function TrackSelection({ registrationSession, student, tracks, existingPreferences }: Props) {
    const [selectedTracks, setSelectedTracks] = useState<Track[]>([]);
    const [draggedItem, setDraggedItem] = useState<number | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        preferences: [] as number[],
    });

    const storageKey = `student_data_${registrationSession.link_token}`;

    // Check if localStorage has valid student data, redirect if not
    useEffect(() => {
        if (typeof window !== 'undefined') {
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
    }, [storageKey, registrationSession.link_token]);

    useEffect(() => {
        if (existingPreferences.length > 0) {
            const orderedTracks = existingPreferences
                .sort((a, b) => a.priority - b.priority)
                .map(pref => tracks.find(track => track.id === pref.registration_session_track.id))
                .filter(track => track !== undefined) as Track[];
            setSelectedTracks(orderedTracks);
            setData('preferences', orderedTracks.map(track => track.id));
        }
    }, [existingPreferences, tracks]);

    const handleTrackToggle = (track: Track) => {
        const isSelected = selectedTracks.find(t => t.id === track.id);
        let newSelectedTracks: Track[];

        if (isSelected) {
            newSelectedTracks = selectedTracks.filter(t => t.id !== track.id);
        } else {
            newSelectedTracks = [...selectedTracks, track];
        }

        setSelectedTracks(newSelectedTracks);
        setData('preferences', newSelectedTracks.map(t => t.id));
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedItem(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedItem === null) return;

        const newSelectedTracks = [...selectedTracks];
        const draggedTrack = newSelectedTracks[draggedItem];
        
        newSelectedTracks.splice(draggedItem, 1);
        newSelectedTracks.splice(dropIndex, 0, draggedTrack);
        
        setSelectedTracks(newSelectedTracks);
        setData('preferences', newSelectedTracks.map(t => t.id));
        setDraggedItem(null);
    };

    const moveTrack = (fromIndex: number, toIndex: number) => {
        const newSelectedTracks = [...selectedTracks];
        const [movedTrack] = newSelectedTracks.splice(fromIndex, 1);
        newSelectedTracks.splice(toIndex, 0, movedTrack);
        
        setSelectedTracks(newSelectedTracks);
        setData('preferences', newSelectedTracks.map(t => t.id));
    };

    const handleSelectAllTracks = () => {
        setSelectedTracks(tracks);
        setData('preferences', tracks.map(t => t.id));
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (selectedTracks.length !== tracks.length) {
            alert(`Please select all ${tracks.length} tracks and prioritize them.`);
            return;
        }
        post(route('student.registration.store.tracks', registrationSession.link_token));
    };

    const availableTracks = tracks.filter(track => 
        !selectedTracks.find(selected => selected.id === track.id)
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <Head title={`Track Selection - ${registrationSession.name}`} />

            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl px-8 py-10 border border-gray-100 dark:border-gray-700">
                    <div className="text-center mb-8">
                        <div className="mx-auto h-16 w-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mb-4">
                            <svg className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Track Selection
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Welcome {student.name}! Select and prioritize your track preferences.
                        </p>
                        <div className="text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3">
                            You must select and prioritize ALL {tracks.length} tracks. Drag and drop to reorder them (1st choice at the top)
                        </div>
                    </div>

                    <form onSubmit={submit}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Available Tracks */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Available Tracks
                                    </h2>
                                    {availableTracks.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleSelectAllTracks}
                                            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                                        >
                                            Select All
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {availableTracks.map((track) => (
                                        <div
                                            key={track.id}
                                            onClick={() => handleTrackToggle(track)}
                                            className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-gray-900 dark:text-white">
                                                        {track.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        {track.description || track.track.description}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="ml-4 px-3 py-1 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition-colors duration-200"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {availableTracks.length === 0 && (
                                        <div className="text-center py-8 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                            <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <p className="font-medium">All tracks selected!</p>
                                            <p className="text-sm">Now prioritize them by dragging to reorder</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Selected Tracks (Priority Order) */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                    Your Track Preferences
                                    <span className={`text-sm font-normal ml-2 ${
                                        selectedTracks.length === tracks.length 
                                            ? 'text-green-600 dark:text-green-400' 
                                            : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                        ({selectedTracks.length}/{tracks.length} required)
                                    </span>
                                </h2>
                                <div className="space-y-3 min-h-[400px]">
                                    {selectedTracks.map((track, index) => (
                                        <div
                                            key={track.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, index)}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, index)}
                                            className={`p-4 border rounded-lg transition-all duration-200 cursor-move ${
                                                draggedItem === index
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                            } bg-white dark:bg-gray-700`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start space-x-3">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="inline-flex items-center justify-center w-6 h-6 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-sm font-semibold rounded-full">
                                                            {index + 1}
                                                        </span>
                                                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-gray-900 dark:text-white">
                                                            {track.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                            {track.description || track.track.description}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2 ml-4">
                                                    {index > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                moveTrack(index, index - 1);
                                                            }}
                                                            className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors duration-200"
                                                            title="Move up"
                                                        >
                                                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                    {index < selectedTracks.length - 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                moveTrack(index, index + 1);
                                                            }}
                                                            className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors duration-200"
                                                            title="Move down"
                                                        >
                                                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {selectedTracks.length === 0 && (
                                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                            <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            <p>No tracks selected yet</p>
                                            <p className="text-sm">You must select all {tracks.length} tracks to proceed</p>
                                            <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-2">
                                                Tip: Use the "Select All" button to add all tracks at once
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {errors.preferences && (
                            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-red-600 dark:text-red-400 text-sm flex items-center">
                                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.preferences}
                                </p>
                            </div>
                        )}

                        {/* Preview Section */}
                        {selectedTracks.length === tracks.length && (
                            <div className="mt-8 border-t border-gray-200 dark:border-gray-600 pt-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Preview Registration Data
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setShowPreview(!showPreview)}
                                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                                    >
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {showPreview ? 'Hide Preview' : 'Show Preview'}
                                        </span>
                                        <svg 
                                            className={`h-4 w-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${showPreview ? 'rotate-180' : ''}`} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>

                                {showPreview && (
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 space-y-6">
                                        {/* Student Information */}
                                        <div>
                                            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                                                <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Student Information
                                            </h4>
                                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Matric Number:</span>
                                                    <p className="text-sm text-gray-900 dark:text-white mt-1">{student.matric_number}</p>
                                                </div>
                                                {student.identification_number && (
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">IC/Passport Number:</span>
                                                        <p className="text-sm text-gray-900 dark:text-white mt-1">{student.identification_number}</p>
                                                    </div>
                                                )}
                                                {student.name && (
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name:</span>
                                                        <p className="text-sm text-gray-900 dark:text-white mt-1">{student.name}</p>
                                                    </div>
                                                )}
                                                {student.gender && (
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender:</span>
                                                        <p className="text-sm text-gray-900 dark:text-white mt-1 capitalize">{student.gender}</p>
                                                    </div>
                                                )}
                                                {student.race && (
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Race:</span>
                                                        <p className="text-sm text-gray-900 dark:text-white mt-1">{student.race}</p>
                                                    </div>
                                                )}
                                                {student.religion && (
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Religion:</span>
                                                        <p className="text-sm text-gray-900 dark:text-white mt-1">{student.religion}</p>
                                                    </div>
                                                )}
                                                {student.email && (
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address:</span>
                                                        <p className="text-sm text-gray-900 dark:text-white mt-1">{student.email}</p>
                                                    </div>
                                                )}
                                                {student.phone && (
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number:</span>
                                                        <p className="text-sm text-gray-900 dark:text-white mt-1">{student.phone}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Track Preferences */}
                                        <div>
                                            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                                                <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                                </svg>
                                                Track Preferences (Priority Order)
                                            </h4>
                                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3">
                                                {selectedTracks.map((track, index) => (
                                                    <div key={track.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                        <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-sm font-bold rounded-full">
                                                            {index + 1}
                                                        </span>
                                                        <div className="flex-1">
                                                            <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {track.name}
                                                            </h5>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                {track.description || track.track.description}
                                                            </p>
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {index === 0 && <span className="font-medium text-green-600 dark:text-green-400">1st Choice</span>}
                                                            {index === 1 && <span className="font-medium text-yellow-600 dark:text-yellow-400">2nd Choice</span>}
                                                            {index === 2 && <span className="font-medium text-orange-600 dark:text-orange-400">3rd Choice</span>}
                                                            {index > 2 && <span className="font-medium">Choice {index + 1}</span>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Registration Session Details */}
                                        <div>
                                            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                                                <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 4v6m-2-6h4m-4 0H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-2" />
                                                </svg>
                                                Registration Session
                                            </h4>
                                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                                                <h5 className="text-sm font-medium text-gray-900 dark:text-white">{registrationSession.name}</h5>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{registrationSession.description}</p>
                                                <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                                    <span>
                                                        <strong>Start:</strong> {new Date(registrationSession.start_date).toLocaleDateString()}
                                                    </span>
                                                    <span>
                                                        <strong>End:</strong> {new Date(registrationSession.end_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Submission Notice */}
                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                            <div className="flex items-start space-x-3">
                                                <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.536 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                </svg>
                                                <div>
                                                    <h5 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                                        Important Notice
                                                    </h5>
                                                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                                        By clicking "Complete Registration", you confirm that all the information above is correct. 
                                                        Your preferences will be submitted and you won't be able to change them after submission.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="pt-8">
                            <button
                                type="submit"
                                disabled={processing || selectedTracks.length !== tracks.length}
                                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                    processing || selectedTracks.length !== tracks.length
                                        ? 'bg-gray-400 dark:bg-gray-500 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 transform hover:scale-105 active:scale-95'
                                }`}
                            >
                                {processing && (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {processing ? 'Submitting Registration...' : 'Complete Registration'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}