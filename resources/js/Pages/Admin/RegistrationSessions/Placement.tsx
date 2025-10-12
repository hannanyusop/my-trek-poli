import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowLeft, AlertCircle, CheckCircle, AlertTriangle, Users, BarChart3, Trash2, Search, X } from 'lucide-react';
import Swal from 'sweetalert2';

interface Class {
    id: number;
    name: string;
    track: string;
    quota: number;
    assigned_count: number;
    available_slots: number;
    gender_distribution: Record<string, number>;
    race_distribution: Record<string, number>;
}

interface Student {
    id: number;
    name: string;
    matric_number: string;
    gender: string;
    race: string;
    placement_status: string;
    placement_notes?: string;
    track_priority?: number | null;
    assigned_class?: {
        id: number;
        name: string;
        registration_session_track: {
            track: {
                name: string;
            };
        };
    };
}

interface Stats {
    total_students: number;
    placed: number;
    manually_assigned: number;
    flagged: number;
    pending: number;
}

interface Props {
    session: {
        id: number;
        name: string;
        status: string;
    };
    students: Student[];
    classes: Class[];
    stats: Stats;
}

export default function Placement({ session, students, classes, stats }: Props) {
    const [viewMode, setViewMode] = useState<'by-status' | 'by-class'>('by-status');
    const [filter, setFilter] = useState<string>('all');
    const [searchName, setSearchName] = useState<string>('');
    const [searchMatric, setSearchMatric] = useState<string>('');
    const [searchGender, setSearchGender] = useState<string>('');
    const [searchRace, setSearchRace] = useState<string>('');

    // Check if editing is allowed (not published)
    const isReadOnly = session.status === 'published';

    const filteredStudents = students.filter(student => {
        if (filter === 'all') return true;
        return student.placement_status === filter;
    });

    // Filter function for By Class view
    const filterStudentBySearch = (student: Student) => {
        const matchesName = searchName === '' || student.name.toLowerCase().includes(searchName.toLowerCase());
        const matchesMatric = searchMatric === '' || student.matric_number.toLowerCase().includes(searchMatric.toLowerCase());
        const matchesGender = searchGender === '' || student.gender.toLowerCase() === searchGender.toLowerCase();
        const matchesRace = searchRace === '' || student.race.toLowerCase().includes(searchRace.toLowerCase());

        return matchesName && matchesMatric && matchesGender && matchesRace;
    };

    // Group students by class
    const studentsByClass = classes.map(cls => ({
        class: cls,
        students: students.filter(s => s.assigned_class?.id === cls.id).filter(filterStudentBySearch)
    }));

    // Unassigned students
    const unassignedStudents = students.filter(s => !s.assigned_class).filter(filterStudentBySearch);

    // Get unique genders and races for dropdowns
    const uniqueGenders = Array.from(new Set(students.map(s => s.gender)));
    const uniqueRaces = Array.from(new Set(students.map(s => s.race)));

    const handleReassign = (studentId: number, studentName: string, currentClassId?: number) => {
        const classOptions = classes.map(c => `<option value="${c.id}" ${currentClassId === c.id ? 'selected' : ''}>${c.name} (${c.track}) - ${c.available_slots} slots left</option>`).join('');

        Swal.fire({
            title: `Reassign ${studentName}`,
            html: `
                <select id="class-select" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Select a class...</option>
                    ${classOptions}
                </select>
            `,
            showCancelButton: true,
            confirmButtonText: 'Assign',
            cancelButtonText: 'Cancel',
            preConfirm: () => {
                const classId = (document.getElementById('class-select') as HTMLSelectElement)?.value;
                if (!classId) {
                    Swal.showValidationMessage('Please select a class');
                    return false;
                }
                return classId;
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                router.put(route('admin.registration-sessions.placement.update', {
                    registration_session: session.id,
                    student: studentId
                }), {
                    class_id: result.value
                }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Success!',
                            text: 'Student has been reassigned.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    }
                });
            }
        });
    };

    const handleClearPlacements = () => {
        Swal.fire({
            title: 'Clear All Placements?',
            text: 'This will remove all student assignments and reset the session to closed status. You can run placement again afterwards.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, clear all',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.registration-sessions.placement.clear', session.id));
            }
        });
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            placed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            manually_assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            flagged: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            pending: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        };
        return badges[status as keyof typeof badges] || badges.pending;
    };

    const getStatusIcon = (status: string) => {
        const icons = {
            placed: <CheckCircle className="h-4 w-4" />,
            manually_assigned: <CheckCircle className="h-4 w-4" />,
            flagged: <AlertCircle className="h-4 w-4" />,
            pending: <AlertTriangle className="h-4 w-4" />
        };
        return icons[status as keyof typeof icons] || icons.pending;
    };

    const getPriorityLabel = (priority?: number | null) => {
        if (!priority) return null;
        const ordinals = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
        return ordinals[priority] || `${priority}th`;
    };

    const getPriorityBadge = (priority?: number | null) => {
        if (!priority) return null;
        const badges: Record<number, string> = {
            1: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            2: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            3: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        };
        return badges[priority] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    };

    return (
        <AppLayout title="Manage Placements">
            <Head title={`Placement Management - ${session.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center">
                            <Link
                                href={route('admin.registration-sessions.show', session.id)}
                                className="mr-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            >
                                <ArrowLeft className="h-6 w-6" />
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {isReadOnly ? 'View Placements' : 'Placement Management'}
                                </h1>
                                <p className="mt-1 text-gray-600 dark:text-gray-400">{session.name}</p>
                            </div>
                        </div>
                        {!isReadOnly && (
                            <button
                                onClick={handleClearPlacements}
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Clear All Placements
                            </button>
                        )}
                    </div>

                    {/* Read-Only Notice */}
                    {isReadOnly && (
                        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                                <div>
                                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                                        Read-Only Mode
                                    </h3>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        Results have been published. Editing is disabled to maintain placement integrity.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_students}</p>
                                </div>
                                <Users className="h-8 w-8 text-gray-400" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Placed</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.placed}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-400" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Manual</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.manually_assigned}</p>
                                </div>
                                <BarChart3 className="h-8 w-8 text-blue-400" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Flagged</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.flagged}</p>
                                </div>
                                <AlertCircle className="h-8 w-8 text-red-400" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                </div>
                                <AlertTriangle className="h-8 w-8 text-yellow-400" />
                            </div>
                        </div>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <div className="flex border-b border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setViewMode('by-status')}
                                className={`px-6 py-3 text-sm font-medium transition-colors ${
                                    viewMode === 'by-status'
                                        ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                            >
                                By Status
                            </button>
                            <button
                                onClick={() => setViewMode('by-class')}
                                className={`px-6 py-3 text-sm font-medium transition-colors ${
                                    viewMode === 'by-class'
                                        ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                            >
                                By Class
                            </button>
                        </div>
                    </div>

                    {/* Filter Tabs - Only show for By Status view */}
                    {viewMode === 'by-status' && (
                        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                            <div className="flex border-b border-gray-200 dark:border-gray-700">
                                {['all', 'placed', 'manually_assigned', 'flagged', 'pending'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        className={`px-6 py-3 text-sm font-medium transition-colors ${
                                            filter === status
                                                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}
                                    >
                                        {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Students Table - By Status View */}
                    {viewMode === 'by-status' && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Matric</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Gender</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Race</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Assigned Class</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredStudents.map((student) => (
                                            <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{student.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{student.matric_number}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{student.gender}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{student.race}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {student.assigned_class ? (
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="font-medium text-gray-900 dark:text-white">{student.assigned_class.name}</div>
                                                                {student.track_priority && (
                                                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getPriorityBadge(student.track_priority)}`}>
                                                                        {getPriorityLabel(student.track_priority)} Choice
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-gray-500 dark:text-gray-400">{student.assigned_class.registration_session_track.track.name}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 dark:text-gray-500">Not assigned</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 w-fit ${getStatusBadge(student.placement_status)}`}>
                                                        {getStatusIcon(student.placement_status)}
                                                        {student.placement_status.replace('_', ' ')}
                                                    </span>
                                                    {student.placement_notes && (
                                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{student.placement_notes}</p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {!isReadOnly ? (
                                                        <button
                                                            onClick={() => handleReassign(student.id, student.name, student.assigned_class?.id)}
                                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                        >
                                                            Reassign
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-400 dark:text-gray-500">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {filteredStudents.length === 0 && (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    No students found with this filter.
                                </div>
                            )}
                        </div>
                    )}

                    {/* By Class View */}
                    {viewMode === 'by-class' && (
                        <div className="space-y-6">
                            {/* Search Filters */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Search className="h-5 w-5 text-gray-400" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Search Students</h3>
                                    {(searchName || searchMatric || searchGender || searchRace) && (
                                        <button
                                            onClick={() => {
                                                setSearchName('');
                                                setSearchMatric('');
                                                setSearchGender('');
                                                setSearchRace('');
                                            }}
                                            className="ml-auto flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            <X className="h-4 w-4" />
                                            Clear All
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label htmlFor="search-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Name
                                        </label>
                                        <input
                                            id="search-name"
                                            type="text"
                                            value={searchName}
                                            onChange={(e) => setSearchName(e.target.value)}
                                            placeholder="Search by name..."
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="search-matric" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Matric Number
                                        </label>
                                        <input
                                            id="search-matric"
                                            type="text"
                                            value={searchMatric}
                                            onChange={(e) => setSearchMatric(e.target.value)}
                                            placeholder="Search by matric..."
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="search-gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Gender
                                        </label>
                                        <select
                                            id="search-gender"
                                            value={searchGender}
                                            onChange={(e) => setSearchGender(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">All Genders</option>
                                            {uniqueGenders.map((gender) => (
                                                <option key={gender} value={gender}>
                                                    {gender}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="search-race" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Race
                                        </label>
                                        <select
                                            id="search-race"
                                            value={searchRace}
                                            onChange={(e) => setSearchRace(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">All Races</option>
                                            {uniqueRaces.map((race) => (
                                                <option key={race} value={race}>
                                                    {race}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Assigned Students by Class */}
                            {studentsByClass.map(({ class: cls, students: classStudents }) => (
                                <div key={cls.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                                    {/* Class Header */}
                                    <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{cls.name}</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{cls.track}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Students: </span>
                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                        {classStudents.length} / {cls.quota}
                                                    </span>
                                                </div>
                                                <div className="text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Available: </span>
                                                    <span className={`font-semibold ${cls.available_slots > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                        {cls.available_slots}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Students in Class */}
                                    {classStudents.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead className="bg-gray-50 dark:bg-gray-700">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Matric</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Gender</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Race</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Priority</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                    {classStudents.map((student) => (
                                                        <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{student.name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{student.matric_number}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{student.gender}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{student.race}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                {student.track_priority ? (
                                                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getPriorityBadge(student.track_priority)}`}>
                                                                        {getPriorityLabel(student.track_priority)} Choice
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-400 dark:text-gray-500">-</span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 w-fit ${getStatusBadge(student.placement_status)}`}>
                                                                    {getStatusIcon(student.placement_status)}
                                                                    {student.placement_status.replace('_', ' ')}
                                                                </span>
                                                                {student.placement_notes && (
                                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{student.placement_notes}</p>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                {!isReadOnly ? (
                                                                    <button
                                                                        onClick={() => handleReassign(student.id, student.name, student.assigned_class?.id)}
                                                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                                    >
                                                                        Reassign
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-gray-400 dark:text-gray-500">-</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            No students assigned to this class yet.
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Unassigned Students */}
                            {unassignedStudents.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                                    {/* Header */}
                                    <div className="bg-red-50 dark:bg-red-900/20 px-6 py-4 border-b border-red-200 dark:border-red-800">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-red-900 dark:text-red-200">Unassigned Students</h3>
                                                <p className="text-sm text-red-700 dark:text-red-300">Students without a class assignment</p>
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-red-700 dark:text-red-300">Count: </span>
                                                <span className="font-semibold text-red-900 dark:text-red-200">{unassignedStudents.length}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Unassigned Students Table */}
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Matric</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Gender</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Race</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {unassignedStudents.map((student) => (
                                                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{student.name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{student.matric_number}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{student.gender}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{student.race}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 w-fit ${getStatusBadge(student.placement_status)}`}>
                                                                {getStatusIcon(student.placement_status)}
                                                                {student.placement_status.replace('_', ' ')}
                                                            </span>
                                                            {student.placement_notes && (
                                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{student.placement_notes}</p>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            {!isReadOnly ? (
                                                                <button
                                                                    onClick={() => handleReassign(student.id, student.name)}
                                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                                >
                                                                    Assign
                                                                </button>
                                                            ) : (
                                                                <span className="text-gray-400 dark:text-gray-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
