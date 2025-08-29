import { FormEventHandler, useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { RegistrationSession, Student, Track } from '@/types';
import StepIndicator from '@/Components/StepIndicator';

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

    const registrationSteps = [
        {
            name: 'Lookup',
            description: 'Enter matric number',
            icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            )
        },
        {
            name: 'Information',
            description: 'Student details',
            icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        },
        {
            name: 'Tracks',
            description: 'Select preferences',
            icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            )
        }
    ];

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

    // Auto-show preview when all tracks are selected
    useEffect(() => {
        if (selectedTracks.length === tracks.length) {
            setShowPreview(true);
        }
    }, [selectedTracks.length, tracks.length]);

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

    const handleBackToForm = () => {
        router.visit(route('student.registration.form', registrationSession.link_token));
    };

    const availableTracks = tracks.filter(track => 
        !selectedTracks.find(selected => selected.id === track.id)
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <Head title={`Track Selection - ${registrationSession.name}`} />

            <div className="max-w-4xl mx-auto">
                <StepIndicator currentStep={1} className="mb-12" />
                
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
                        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-indigo-900 dark:text-indigo-100">Track Selection Progress</h3>
                                    <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                                        You must select and prioritize ALL {tracks.length} tracks. Drag and drop to reorder them.
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                            {selectedTracks.length}/{tracks.length}
                                        </div>
                                        <div className="text-xs text-indigo-500 dark:text-indigo-400">
                                            {selectedTracks.length === tracks.length ? 'Complete!' : 'Required'}
                                        </div>
                                    </div>
                                    <div className="w-16 h-16 relative">
                                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                                            <path
                                                className="text-indigo-200 dark:text-indigo-700"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                            <path
                                                className={selectedTracks.length === tracks.length ? 'text-green-500' : 'text-indigo-500'}
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                fill="none"
                                                strokeDasharray={`${(selectedTracks.length / tracks.length) * 100}, 100`}
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                        </svg>
                                        {selectedTracks.length === tracks.length && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
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


                        <div className="pt-8 flex gap-4">
                            <button
                                type="button"
                                onClick={handleBackToForm}
                                className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                <svg className="h-4 w-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to Information
                            </button>
                            <button
                                type="submit"
                                disabled={processing || selectedTracks.length !== tracks.length}
                                className={`flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
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
                                {processing ? 'Saving Preferences...' : 'Next: Review & Submit'}
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