import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { X, Calendar as CalendarIcon, MapPin, BookOpen, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/Components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/Components/ui/popover';
import { cn } from '@/lib/utils';

interface Track {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
}

interface ClassItem {
    id: string;
    name: string;
    quota: number;
}

interface RegistrationSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    tracks: Track[];
}

export default function RegistrationSessionModal({ isOpen, onClose, tracks }: RegistrationSessionModalProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedTracks, setSelectedTracks] = useState<number[]>([]);
    const [classes, setClasses] = useState<Record<number, ClassItem[]>>({});

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        tracks: [] as number[],
        classes: {} as Record<number, ClassItem[]>
    });

    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();

    const steps = [
        { number: 1, title: 'Registration Details', icon: CalendarIcon },
        { number: 2, title: 'Select Tracks', icon: MapPin },
        { number: 3, title: 'Add Classes', icon: BookOpen }
    ];

    // Validation function for step 1
    const validateStep1 = (): boolean => {
        return !!(data.name.trim() && startDate && endDate);
    };

    // Validation function for step 2
    const validateStep2 = (): boolean => {
        return selectedTracks.length > 0;
    };

    const handleNext = () => {
        if (currentStep < 3) {
            // Validate current step before proceeding
            if (currentStep === 1 && !validateStep1()) {
                return;
            }
            if (currentStep === 2 && !validateStep2()) {
                return;
            }
            
            if (currentStep === 1) {
                // Update form data with selected dates
                setData(prev => ({
                    ...prev,
                    start_date: startDate ? format(startDate, 'yyyy-MM-dd\'T\'HH:mm') : '',
                    end_date: endDate ? format(endDate, 'yyyy-MM-dd\'T\'HH:mm') : ''
                }));
            }
            if (currentStep === 2) {
                setData(prev => ({ ...prev, tracks: selectedTracks, classes: classes }));
            }
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleTrackToggle = (trackId: number) => {
        setSelectedTracks(prev => {
            const updated = prev.includes(trackId) 
                ? prev.filter(id => id !== trackId)
                : [...prev, trackId];
            
            // Initialize classes for newly selected tracks
            if (!prev.includes(trackId)) {
                setClasses(prevClasses => ({
                    ...prevClasses,
                    [trackId]: []
                }));
            } else {
                // Remove classes for deselected tracks
                setClasses(prevClasses => {
                    const newClasses = { ...prevClasses };
                    delete newClasses[trackId];
                    return newClasses;
                });
            }
            
            return updated;
        });
    };

    const addClass = (trackId: number) => {
        const newClass: ClassItem = {
            id: `class_${Date.now()}_${Math.random()}`,
            name: '',
            quota: 0
        };
        
        setClasses(prev => ({
            ...prev,
            [trackId]: [...(prev[trackId] || []), newClass]
        }));
    };

    const updateClass = (trackId: number, classId: string, field: 'name' | 'quota', value: string | number) => {
        setClasses(prev => ({
            ...prev,
            [trackId]: prev[trackId].map(cls => 
                cls.id === classId ? { ...cls, [field]: value } : cls
            )
        }));
    };

    const removeClass = (trackId: number, classId: string) => {
        setClasses(prev => ({
            ...prev,
            [trackId]: prev[trackId].filter(cls => cls.id !== classId)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = {
            ...data,
            tracks: selectedTracks,
            classes: classes
        };

        post(route('admin.registration-sessions.store'), {
            onSuccess: () => {
                reset();
                setCurrentStep(1);
                setSelectedTracks([]);
                setClasses({});
                onClose();
            }
        });
    };

    const handleClose = () => {
        reset();
        setCurrentStep(1);
        setSelectedTracks([]);
        setClasses({});
        setStartDate(undefined);
        setEndDate(undefined);
        onClose();
    };

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
            onClick={handleClose}
        >
            <div 
                className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Create Registration Session
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <div key={step.number} className="flex items-center">
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                        currentStep >= step.number
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                    }`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <span className={`ml-2 text-sm font-medium ${
                                        currentStep >= step.number
                                            ? 'text-indigo-600 dark:text-indigo-400'
                                            : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                        {step.title}
                                    </span>
                                    {index < steps.length - 1 && (
                                        <div className={`w-12 h-0.5 mx-4 ${
                                            currentStep > step.number
                                                ? 'bg-indigo-600'
                                                : 'bg-gray-200 dark:bg-gray-700'
                                        }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-6">
                        {/* Step 1: Registration Details */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Session Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="e.g., Semester 1 2024/2025"
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Description
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        rows={3}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Brief description of this registration session"
                                    />
                                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Start Date *
                                        </label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button
                                                    type="button"
                                                    className={cn(
                                                        "mt-1 w-full flex items-center justify-start px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500",
                                                        !startDate && "text-gray-500 dark:text-gray-400"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {startDate ? format(startDate, "PPP") : "Pick a start date"}
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={startDate}
                                                    onSelect={setStartDate}
                                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            End Date *
                                        </label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button
                                                    type="button"
                                                    className={cn(
                                                        "mt-1 w-full flex items-center justify-start px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500",
                                                        !endDate && "text-gray-500 dark:text-gray-400"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {endDate ? format(endDate, "PPP") : "Pick an end date"}
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={endDate}
                                                    onSelect={setEndDate}
                                                    disabled={(date) => {
                                                        const today = new Date(new Date().setHours(0, 0, 0, 0));
                                                        const minDate = startDate || today;
                                                        return date < minDate;
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
                                    </div>
                                </div>

                            </div>
                        )}

                        {/* Step 2: Track Selection */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                        Select Tracks for this Session
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                        Choose which tracks will be available for registration in this session.
                                    </p>
                                </div>

                                {tracks.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {tracks.map((track) => (
                                            <div key={track.id} className="relative">
                                                <label className="flex items-start p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedTracks.includes(track.id)}
                                                        onChange={() => handleTrackToggle(track.id)}
                                                        className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                    />
                                                    <div className="ml-3 flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <h5 className="font-medium text-gray-900 dark:text-white">
                                                                {track.name}
                                                            </h5>
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                                track.is_active 
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                                            }`}>
                                                                {track.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                            {track.description}
                                                        </p>
                                                    </div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <MapPin className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                                        <p>No tracks available. Please create tracks first.</p>
                                    </div>
                                )}

                                {selectedTracks.length === 0 && (
                                    <p className="text-sm text-amber-600 dark:text-amber-400">
                                        Please select at least one track to continue.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Step 3: Add Classes */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                        Add Classes & Set Quotas
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                        Create classes for each selected track and set their capacity.
                                    </p>
                                </div>

                                {selectedTracks.map(trackId => {
                                    const track = tracks.find(t => t.id === trackId);
                                    if (!track) return null;

                                    return (
                                        <div key={trackId} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h5 className="font-medium text-gray-900 dark:text-white">
                                                    {track.name}
                                                </h5>
                                                <button
                                                    type="button"
                                                    onClick={() => addClass(trackId)}
                                                    className="flex items-center px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                                >
                                                    <Plus className="w-4 h-4 mr-1" />
                                                    Add Class
                                                </button>
                                            </div>

                                            <div className="space-y-3">
                                                {(classes[trackId] || []).map((classItem) => (
                                                    <div key={classItem.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                                                        <div className="flex-1">
                                                            <input
                                                                type="text"
                                                                value={classItem.name}
                                                                onChange={e => updateClass(trackId, classItem.id, 'name', e.target.value)}
                                                                placeholder="Class name (e.g., Class A, Morning Session)"
                                                                className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                                            />
                                                        </div>
                                                        <div className="w-24">
                                                            <input
                                                                type="number"
                                                                value={classItem.quota}
                                                                onChange={e => updateClass(trackId, classItem.id, 'quota', parseInt(e.target.value) || 0)}
                                                                placeholder="Quota"
                                                                min="1"
                                                                className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeClass(trackId, classItem.id)}
                                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}

                                                {(!classes[trackId] || classes[trackId].length === 0) && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                                        No classes added yet. Click "Add Class" to create one.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
                        <button
                            type="button"
                            onClick={handlePrev}
                            disabled={currentStep === 1}
                            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Previous
                        </button>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500"
                            >
                                Cancel
                            </button>

                            {currentStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={
                                        (currentStep === 1 && !validateStep1()) ||
                                        (currentStep === 2 && !validateStep2())
                                    }
                                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {processing ? 'Creating...' : 'Create Session'}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}