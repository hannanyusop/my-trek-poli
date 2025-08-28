import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import RegistrationSessionModal from '@/Components/RegistrationSessionModal';
import { Calendar, Users, BookOpen, Clock, MapPin, User, Plus } from 'lucide-react';

interface RegistrationSession {
    id: number;
    name: string;
    status: string;
    start_date: string;
    end_date: string;
    description: string;
}

interface Track {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
}

interface Class {
    id: number;
    name: string;
    quota: number;
    current_count: number;
    is_active: boolean;
}

interface Student {
    id: number;
    name: string;
    matric_number: string;
    email: string;
    is_submitted: boolean;
    submitted_at: string | null;
}

interface Props {
    registrationSessions?: RegistrationSession[];
    tracks?: Track[];
    classes?: Class[];
    students?: Student[];
    availableTracks?: Track[];
}

export default function SemesterRegistration({ 
    registrationSessions = [], 
    tracks = [], 
    classes = [], 
    students = [],
    availableTracks = []
}: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'closed':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    return (
        <AppLayout>
            <Head title="Semester Registration" />
            
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                                        <Calendar className="mr-3 h-8 w-8" />
                                        Semester Registration
                                    </h1>
                                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                                        Register for courses and manage your semester enrollment
                                    </p>
                                </div>
                                
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Registration Session
                                </button>
                            </div>

                            <div className="space-y-8">
                                {/* Registration Sessions List */}
                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                        <Calendar className="mr-2 h-5 w-5" />
                                        Registration Sessions
                                    </h2>
                                    
                                    {registrationSessions.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead className="bg-gray-50 dark:bg-gray-700">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Name
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Duration
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Description
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                    {registrationSessions.map((session) => (
                                                        <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {session.name}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>
                                                                    {session.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900 dark:text-white">
                                                                    <div className="flex items-center">
                                                                        <Clock className="mr-1 h-4 w-4 text-gray-400" />
                                                                        {new Date(session.start_date).toLocaleDateString()} - {new Date(session.end_date).toLocaleDateString()}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="text-sm text-gray-900 dark:text-white">
                                                                    {session.description}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            <Calendar className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                                            <p>No registration sessions available.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Available Tracks List */}
                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                        <MapPin className="mr-2 h-5 w-5" />
                                        Available Tracks
                                    </h2>
                                    
                                    {tracks.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {tracks.map((track) => (
                                                <div key={track.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="font-medium text-gray-900 dark:text-white">
                                                            {track.name}
                                                        </h3>
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                            track.is_active 
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                                        }`}>
                                                            {track.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                                        {track.description}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            <MapPin className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                                            <p>No tracks available.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Available Classes List */}
                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                        <BookOpen className="mr-2 h-5 w-5" />
                                        Available Classes
                                    </h2>
                                    
                                    {classes.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead className="bg-gray-50 dark:bg-gray-700">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Class Name
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Capacity
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Availability
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                    {classes.map((classItem) => {
                                                        const availableSlots = classItem.quota - classItem.current_count;
                                                        const isFullyBooked = availableSlots <= 0;
                                                        
                                                        return (
                                                            <tr key={classItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                        {classItem.name}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm text-gray-900 dark:text-white">
                                                                        <div className="flex items-center">
                                                                            <Users className="mr-1 h-4 w-4 text-gray-400" />
                                                                            {classItem.current_count} / {classItem.quota}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                                        isFullyBooked 
                                                                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                                            : availableSlots <= 5 
                                                                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                    }`}>
                                                                        {isFullyBooked ? 'Full' : `${availableSlots} slots`}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                                        classItem.is_active 
                                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                                                    }`}>
                                                                        {classItem.is_active ? 'Open' : 'Closed'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            <BookOpen className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                                            <p>No classes available.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Registered Students List */}
                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                        <User className="mr-2 h-5 w-5" />
                                        Registered Students
                                    </h2>
                                    
                                    {students.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead className="bg-gray-50 dark:bg-gray-700">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Name
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Matric Number
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Email
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Submitted
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                    {students.map((student) => (
                                                        <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {student.name}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900 dark:text-white">
                                                                    {student.matric_number}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900 dark:text-white">
                                                                    {student.email}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                                    student.is_submitted 
                                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                                }`}>
                                                                    {student.is_submitted ? 'Submitted' : 'Pending'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {student.submitted_at 
                                                                        ? new Date(student.submitted_at).toLocaleDateString()
                                                                        : '-'
                                                                    }
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            <User className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                                            <p>No students registered yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Registration Session Modal */}
            <RegistrationSessionModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                tracks={availableTracks.length > 0 ? availableTracks : tracks}
            />
        </AppLayout>
    );
}