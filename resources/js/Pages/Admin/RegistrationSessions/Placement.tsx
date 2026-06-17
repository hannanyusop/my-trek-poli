import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowLeft, AlertCircle, CheckCircle, AlertTriangle, Users, BarChart3, Trash2, Search, X, Download, Eye, Mail, Phone, ListOrdered, PieChart } from 'lucide-react';
import Swal from 'sweetalert2';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

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

interface TrackChoice {
    priority: number;
    track_name: string;
}

interface Student {
    id: number;
    name: string;
    matric_number: string;
    gender: string;
    race: string;
    email?: string;
    phone?: string;
    submitted_at?: string | null;
    placement_status: string;
    placement_notes?: string;
    track_priority?: number | null;
    track_choices?: TrackChoice[];
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

// Color palettes for charts
const GENDER_COLORS: Record<string, string> = {
    'Male': '#3b82f6',
    'Female': '#ec4899',
    'Lelaki': '#3b82f6',
    'Perempuan': '#ec4899',
};

const RACE_COLORS: Record<string, string> = {
    'Malay': '#10b981',
    'Chinese': '#f59e0b',
    'Indian': '#8b5cf6',
    'Melayu': '#10b981',
    'Cina': '#f59e0b',
    'India': '#8b5cf6',
    'Other': '#6b7280',
    'Lain-lain': '#6b7280',
    'Bumiputera Sabah': '#06b6d4',
    'Bumiputera Sarawak': '#14b8a6',
};

export default function Placement({ session, students, classes, stats }: Props) {
    const [viewMode, setViewMode] = useState<'by-status' | 'by-class' | 'charts'>('by-status');
    const [filter, setFilter] = useState<string>('all');
    const [searchName, setSearchName] = useState<string>('');
    const [searchMatric, setSearchMatric] = useState<string>('');
    const [searchGender, setSearchGender] = useState<string>('');
    const [searchRace, setSearchRace] = useState<string>('');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    // Check if editing is allowed (not published)
    const isReadOnly = session.status === 'published';

    // Prepare chart data
    const chartData = useMemo(() => {
        // Get all unique genders and races across all classes
        const allGenders = new Set<string>();
        const allRaces = new Set<string>();

        classes.forEach(cls => {
            Object.keys(cls.gender_distribution || {}).forEach(g => allGenders.add(g));
            Object.keys(cls.race_distribution || {}).forEach(r => allRaces.add(r));
        });

        const genderKeys = Array.from(allGenders);
        const raceKeys = Array.from(allRaces);

        // Gender distribution data for stacked bar chart
        const genderChartData = classes.map(cls => {
            const data: Record<string, string | number> = { name: cls.name, track: cls.track };
            genderKeys.forEach(gender => {
                data[gender] = cls.gender_distribution?.[gender] || 0;
            });
            return data;
        });

        // Race distribution data for stacked bar chart
        const raceChartData = classes.map(cls => {
            const data: Record<string, string | number> = { name: cls.name, track: cls.track };
            raceKeys.forEach(race => {
                data[race] = cls.race_distribution?.[race] || 0;
            });
            return data;
        });

        // Capacity data (assigned vs quota)
        const capacityChartData = classes.map(cls => ({
            name: cls.name,
            track: cls.track,
            assigned: cls.assigned_count,
            available: cls.available_slots,
            quota: cls.quota,
        }));

        // Priority distribution data (how many students got their 1st, 2nd, 3rd choice)
        const priorityCounts: Record<string, number> = {};
        students.forEach(student => {
            if (student.track_priority) {
                const label = student.track_priority === 1 ? '1st Choice'
                    : student.track_priority === 2 ? '2nd Choice'
                    : student.track_priority === 3 ? '3rd Choice'
                    : `${student.track_priority}th Choice`;
                priorityCounts[label] = (priorityCounts[label] || 0) + 1;
            }
        });

        const priorityChartData = Object.entries(priorityCounts)
            .sort((a, b) => {
                const getOrder = (label: string) => {
                    if (label.startsWith('1st')) return 1;
                    if (label.startsWith('2nd')) return 2;
                    if (label.startsWith('3rd')) return 3;
                    return parseInt(label) || 99;
                };
                return getOrder(a[0]) - getOrder(b[0]);
            })
            .map(([priority, count]) => ({
                priority,
                count,
            }));

        // Priority distribution by class
        const priorityByClassData = classes.map(cls => {
            const classStudents = students.filter(s => s.assigned_class?.id === cls.id);
            const priorities: Record<string, number> = {
                '1st Choice': 0,
                '2nd Choice': 0,
                '3rd Choice': 0,
                'Other': 0,
            };
            classStudents.forEach(student => {
                if (student.track_priority === 1) priorities['1st Choice']++;
                else if (student.track_priority === 2) priorities['2nd Choice']++;
                else if (student.track_priority === 3) priorities['3rd Choice']++;
                else if (student.track_priority) priorities['Other']++;
            });
            return {
                name: cls.name,
                track: cls.track,
                ...priorities,
            };
        });

        return {
            genderKeys,
            raceKeys,
            genderChartData,
            raceChartData,
            capacityChartData,
            priorityChartData,
            priorityByClassData,
        };
    }, [classes, students]);

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

    const formatSubmittedAt = (submittedAt?: string | null) => {
        if (!submittedAt) return '-';

        return new Intl.DateTimeFormat(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(submittedAt));
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
                        <div className="flex items-center gap-2">
                            <a
                                href={route('admin.registration-sessions.placement.export-all', session.id)}
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export All
                            </a>
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
                            <button
                                onClick={() => setViewMode('charts')}
                                className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                                    viewMode === 'charts'
                                        ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                            >
                                <PieChart className="h-4 w-4" />
                                Charts
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
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Submitted At</th>
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
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{formatSubmittedAt(student.submitted_at)}</td>
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
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => setSelectedStudent(student)}
                                                            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                                                            title="View Details"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        {!isReadOnly && (
                                                            <button
                                                                onClick={() => handleReassign(student.id, student.name, student.assigned_class?.id)}
                                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                            >
                                                                Reassign
                                                            </button>
                                                        )}
                                                    </div>
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
                                                <a
                                                    href={route('admin.registration-sessions.placement.export-class', { registration_session: session.id, class: cls.id })}
                                                    className="flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                                                >
                                                    <Download className="mr-1.5 h-3.5 w-3.5" />
                                                    Export
                                                </a>
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
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Submitted At</th>
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
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{formatSubmittedAt(student.submitted_at)}</td>
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
                                                                <div className="flex items-center gap-3">
                                                                    <button
                                                                        onClick={() => setSelectedStudent(student)}
                                                                        className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                                                                        title="View Details"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </button>
                                                                    {!isReadOnly && (
                                                                        <button
                                                                            onClick={() => handleReassign(student.id, student.name, student.assigned_class?.id)}
                                                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                                        >
                                                                            Reassign
                                                                        </button>
                                                                    )}
                                                                </div>
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
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Submitted At</th>
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
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{formatSubmittedAt(student.submitted_at)}</td>
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
                                                            <div className="flex items-center gap-3">
                                                                <button
                                                                    onClick={() => setSelectedStudent(student)}
                                                                    className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                                                                    title="View Details"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </button>
                                                                {!isReadOnly && (
                                                                    <button
                                                                        onClick={() => handleReassign(student.id, student.name)}
                                                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                                    >
                                                                        Assign
                                                                    </button>
                                                                )}
                                                            </div>
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

                    {/* Charts View */}
                    {viewMode === 'charts' && (
                        <div className="space-y-6">
                            {/* Class Capacity Chart */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <BarChart3 className="h-5 w-5 text-blue-500" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Class Capacity</h3>
                                </div>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData.capacityChartData} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <XAxis type="number" stroke="#9ca3af" />
                                            <YAxis
                                                type="category"
                                                dataKey="name"
                                                width={120}
                                                stroke="#9ca3af"
                                                tick={{ fontSize: 12 }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#1f2937',
                                                    border: '1px solid #374151',
                                                    borderRadius: '8px',
                                                    color: '#f9fafb',
                                                }}
                                                labelStyle={{ color: '#f9fafb' }}
                                            />
                                            <Legend />
                                            <Bar dataKey="assigned" name="Assigned" fill="#10b981" stackId="capacity" />
                                            <Bar dataKey="available" name="Available" fill="#6b7280" stackId="capacity" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Priority Distribution Chart */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <ListOrdered className="h-5 w-5 text-amber-500" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Student Distribution by Priority</h3>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Overall Priority Distribution */}
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Overall Priority Distribution</h4>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={chartData.priorityChartData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                                    <XAxis dataKey="priority" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                                                    <YAxis stroke="#9ca3af" />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: '#1f2937',
                                                            border: '1px solid #374151',
                                                            borderRadius: '8px',
                                                            color: '#f9fafb',
                                                        }}
                                                        labelStyle={{ color: '#f9fafb' }}
                                                    />
                                                    <Bar dataKey="count" name="Students" fill="#f59e0b">
                                                        {chartData.priorityChartData.map((entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={
                                                                    entry.priority === '1st Choice' ? '#10b981'
                                                                    : entry.priority === '2nd Choice' ? '#3b82f6'
                                                                    : entry.priority === '3rd Choice' ? '#f59e0b'
                                                                    : '#6b7280'
                                                                }
                                                            />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    {/* Priority by Class */}
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Priority Distribution by Class</h4>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={chartData.priorityByClassData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                                    <XAxis
                                                        dataKey="name"
                                                        stroke="#9ca3af"
                                                        tick={{ fontSize: 10 }}
                                                        angle={-45}
                                                        textAnchor="end"
                                                        height={60}
                                                    />
                                                    <YAxis stroke="#9ca3af" />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: '#1f2937',
                                                            border: '1px solid #374151',
                                                            borderRadius: '8px',
                                                            color: '#f9fafb',
                                                        }}
                                                        labelStyle={{ color: '#f9fafb' }}
                                                    />
                                                    <Legend />
                                                    <Bar dataKey="1st Choice" name="1st Choice" fill="#10b981" stackId="priority" />
                                                    <Bar dataKey="2nd Choice" name="2nd Choice" fill="#3b82f6" stackId="priority" />
                                                    <Bar dataKey="3rd Choice" name="3rd Choice" fill="#f59e0b" stackId="priority" />
                                                    <Bar dataKey="Other" name="Other" fill="#6b7280" stackId="priority" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Gender Distribution Chart */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <Users className="h-5 w-5 text-pink-500" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gender Distribution by Class</h3>
                                </div>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData.genderChartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <XAxis
                                                dataKey="name"
                                                stroke="#9ca3af"
                                                tick={{ fontSize: 12 }}
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                            />
                                            <YAxis stroke="#9ca3af" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#1f2937',
                                                    border: '1px solid #374151',
                                                    borderRadius: '8px',
                                                    color: '#f9fafb',
                                                }}
                                                labelStyle={{ color: '#f9fafb' }}
                                            />
                                            <Legend />
                                            {chartData.genderKeys.map((gender) => (
                                                <Bar
                                                    key={gender}
                                                    dataKey={gender}
                                                    name={gender}
                                                    fill={GENDER_COLORS[gender] || '#6b7280'}
                                                    stackId="gender"
                                                />
                                            ))}
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Race Distribution Chart */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <PieChart className="h-5 w-5 text-purple-500" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Race Distribution by Class</h3>
                                </div>
                                <div className="h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData.raceChartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <XAxis
                                                dataKey="name"
                                                stroke="#9ca3af"
                                                tick={{ fontSize: 12 }}
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                            />
                                            <YAxis stroke="#9ca3af" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#1f2937',
                                                    border: '1px solid #374151',
                                                    borderRadius: '8px',
                                                    color: '#f9fafb',
                                                }}
                                                labelStyle={{ color: '#f9fafb' }}
                                            />
                                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                            {chartData.raceKeys.map((race) => (
                                                <Bar
                                                    key={race}
                                                    dataKey={race}
                                                    name={race}
                                                    fill={RACE_COLORS[race] || '#6b7280'}
                                                    stackId="race"
                                                />
                                            ))}
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Summary Table */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Distribution Summary</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Class</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Track</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Assigned / Quota</th>
                                                {chartData.genderKeys.map((gender) => (
                                                    <th key={gender} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                                        {gender}
                                                    </th>
                                                ))}
                                                {chartData.raceKeys.map((race) => (
                                                    <th key={race} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                                        {race}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {classes.map((cls) => (
                                                <tr key={cls.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{cls.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{cls.track}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span className={`font-semibold ${cls.assigned_count === cls.quota ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                                            {cls.assigned_count}
                                                        </span>
                                                        <span className="text-gray-500 dark:text-gray-400"> / {cls.quota}</span>
                                                    </td>
                                                    {chartData.genderKeys.map((gender) => (
                                                        <td key={gender} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                            {cls.gender_distribution?.[gender] || 0}
                                                        </td>
                                                    ))}
                                                    {chartData.raceKeys.map((race) => (
                                                        <td key={race} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                            {cls.race_distribution?.[race] || 0}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* View Student Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                            onClick={() => setSelectedStudent(null)}
                        />

                        {/* Modal Content */}
                        <div className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            {/* Header */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-4 border-b border-blue-200 dark:border-blue-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                                            <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Student Details
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                View student information and track choices
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedStudent(null)}
                                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="px-6 py-4 space-y-6">
                                {/* Basic Info */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                                        Basic Information
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedStudent.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Matric Number</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedStudent.matric_number}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedStudent.gender}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Race</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedStudent.race}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Submitted At</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{formatSubmittedAt(selectedStudent.submitted_at)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                {(selectedStudent.email || selectedStudent.phone) && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                                            Contact Information
                                        </h4>
                                        <div className="space-y-2">
                                            {selectedStudent.email && (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm text-gray-900 dark:text-white">{selectedStudent.email}</span>
                                                </div>
                                            )}
                                            {selectedStudent.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm text-gray-900 dark:text-white">{selectedStudent.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Track Choices */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <ListOrdered className="h-4 w-4" />
                                        Track Choices
                                    </h4>
                                    {selectedStudent.track_choices && selectedStudent.track_choices.length > 0 ? (
                                        <div className="space-y-2">
                                            {selectedStudent.track_choices.map((choice) => (
                                                <div
                                                    key={choice.priority}
                                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className={`px-2 py-1 text-xs font-semibold rounded ${getPriorityBadge(choice.priority)}`}>
                                                            {getPriorityLabel(choice.priority)}
                                                        </span>
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {choice.track_name}
                                                        </span>
                                                    </div>
                                                    {selectedStudent.assigned_class?.registration_session_track.track.name === choice.track_name && (
                                                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                                            Assigned
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">No track choices recorded.</p>
                                    )}
                                </div>

                                {/* Placement Status */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                                        Placement Status
                                    </h4>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 w-fit ${getStatusBadge(selectedStudent.placement_status)}`}>
                                            {getStatusIcon(selectedStudent.placement_status)}
                                            {selectedStudent.placement_status.replace('_', ' ')}
                                        </span>
                                        {selectedStudent.assigned_class && (
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                → {selectedStudent.assigned_class.name} ({selectedStudent.assigned_class.registration_session_track.track.name})
                                            </span>
                                        )}
                                    </div>
                                    {selectedStudent.placement_notes && (
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic">
                                            {selectedStudent.placement_notes}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                                <button
                                    onClick={() => setSelectedStudent(null)}
                                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
