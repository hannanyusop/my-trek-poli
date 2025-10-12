import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Calendar, Users, BookOpen, Clock, ArrowLeft, QrCode, User, Target, Monitor, RotateCcw, FileSpreadsheet, FileText, Upload, UserPlus, Trash2, ChevronDown, MoreVertical, Copy, Check, Sparkles, XCircle, PlayCircle, Settings, Eye } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { RegistrationSession, Student, Class, PageProps } from '@/types';
import { getStatusColor } from '@/lib/utils';
import AddSingleStudentModal from '@/Components/AddSingleStudentModal';
import Swal from 'sweetalert2';

interface Props {
    session: RegistrationSession;
    classes: Class[];
    students: Student[];
    registrationLink: string;
}

export default function Show({ session, classes, students, registrationLink }: Props) {
    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
    const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsActionsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to copy to clipboard. Please try again.',
                icon: 'error',
                timer: 2000,
                showConfirmButton: false
            });
        }
    };

    const handleUndoSubmission = (studentId: number, studentName: string) => {
        Swal.fire({
            title: 'Undo Submission?',
            text: `Are you sure you want to undo the submission for ${studentName}? This will reset their status to pending.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, undo',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.registration-sessions.undo-submission', session.id), {
                    student_id: studentId,
                }, {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Undone!',
                            text: 'Student submission has been reset to pending.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    },
                    onError: () => {
                        Swal.fire({
                            title: 'Error!',
                            text: 'Failed to undo submission. Please try again.',
                            icon: 'error'
                        });
                    }
                });
            }
        });
    };

    const handleDeleteStudent = (studentId: number, studentName: string) => {
        Swal.fire({
            title: 'Delete Student?',
            text: `Are you sure you want to delete ${studentName}? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.registration-sessions.delete-student', session.id), {
                    data: { student_id: studentId },
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Student has been deleted successfully.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    },
                    onError: () => {
                        Swal.fire({
                            title: 'Error!',
                            text: 'Failed to delete student. Please try again.',
                            icon: 'error'
                        });
                    }
                });
            }
        });
    };

    const handleGenerateDummyStudent = () => {
        Swal.fire({
            title: 'Generate Dummy Students',
            html: `
                <div class="text-left">
                    <p class="text-sm text-gray-600 mb-4">This will create dummy students with randomized data and automatically submit their registration forms.</p>
                    <label class="block text-sm font-medium text-gray-700 mb-2">How many students do you want to create?</label>
                    <input
                        type="number"
                        id="student-count"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value="1"
                        min="1"
                        max="100"
                    />
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#8b5cf6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Generate',
            cancelButtonText: 'Cancel',
            preConfirm: () => {
                const count = (document.getElementById('student-count') as HTMLInputElement)?.value;
                const numCount = parseInt(count || '1', 10);

                if (isNaN(numCount) || numCount < 1) {
                    Swal.showValidationMessage('Please enter a valid number (minimum 1)');
                    return false;
                }

                if (numCount > 100) {
                    Swal.showValidationMessage('Maximum 100 students at a time');
                    return false;
                }

                return numCount;
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                const count = result.value;

                // Show loading
                Swal.fire({
                    title: 'Generating...',
                    text: `Creating ${count} dummy student${count > 1 ? 's' : ''}...`,
                    icon: 'info',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                router.post(route('admin.registration-sessions.generate-dummy', session.id), {
                    count: count
                }, {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Success!',
                            text: `${count} dummy student${count > 1 ? 's' : ''} generated and registered successfully!`,
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    },
                    onError: (errors) => {
                        const errorMessage = Object.values(errors).flat().join(' ');
                        Swal.fire({
                            title: 'Error!',
                            text: errorMessage || 'Failed to generate dummy students. Please try again.',
                            icon: 'error'
                        });
                    }
                });
            }
        });
    };

    const handleGenerateTestStudent = () => {
        Swal.fire({
            title: 'Generate Test Student?',
            text: 'This will create a test student with dummy data that you can use to fill up the registration form. The student will NOT be auto-submitted.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Generate Test Student',
            cancelButtonText: 'Cancel',
            html: '<p class="text-sm text-gray-600 mt-2">After generation, you will receive a link to test the registration flow.</p>'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.registration-sessions.generate-test-student', session.id), {}, {
                    onSuccess: (page: { props: PageProps }) => {
                        // Extract the registration link from the success message
                        const successMessage = page.props.flash?.success || '';
                        const linkMatch = successMessage.match(/(http[s]?:\/\/[^\s]+)/);
                        const registrationLink = linkMatch ? linkMatch[1] : '';

                        Swal.fire({
                            title: 'Test Student Created!',
                            html: successMessage.replace(registrationLink, `<br><br><a href="${registrationLink}" target="_blank" class="text-blue-600 underline hover:text-blue-800">Click here to test registration</a>`),
                            icon: 'success',
                            confirmButtonText: 'OK',
                            showCancelButton: true,
                            cancelButtonText: 'Open Link',
                            cancelButtonColor: '#3b82f6'
                        }).then((result) => {
                            if (!result.isConfirmed && registrationLink) {
                                window.open(registrationLink, '_blank');
                            }
                        });
                    },
                    onError: (errors) => {
                        const errorMessage = Object.values(errors).flat().join(' ');
                        Swal.fire({
                            title: 'Error!',
                            text: errorMessage || 'Failed to generate test student. Please try again.',
                            icon: 'error'
                        });
                    }
                });
            }
        });
    };

    const handleCloseSession = () => {
        Swal.fire({
            title: 'Close Registration Session?',
            text: 'Are you sure you want to close this registration session? Students will no longer be able to register.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, close session',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.registration-sessions.close', session.id), {}, {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Closed!',
                            text: 'Registration session has been closed successfully.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    },
                    onError: () => {
                        Swal.fire({
                            title: 'Error!',
                            text: 'Failed to close session. Please try again.',
                            icon: 'error'
                        });
                    }
                });
            }
        });
    };

    const handleStartPlacement = () => {
        Swal.fire({
            title: 'Start Automatic Placement?',
            html: `
                <p class="text-sm text-gray-600 mb-2">This will automatically assign students to classes based on:</p>
                <ul class="text-left text-sm text-gray-600 list-disc pl-6">
                    <li>Student preferences (1st → 2nd → 3rd choice)</li>
                    <li>First-come, first-served order</li>
                    <li>Gender and race balance (proportional distribution)</li>
                </ul>
                <p class="text-sm text-gray-600 mt-4">The process may take several minutes for large groups.</p>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Start Placement',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Processing...',
                    text: 'Starting automatic placement. Please wait...',
                    icon: 'info',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                router.post(route('admin.registration-sessions.start-placement', session.id), {}, {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Started!',
                            text: 'Placement processing has started. The page will refresh when complete.',
                            icon: 'success',
                            timer: 3000,
                            showConfirmButton: false
                        });

                        // Poll for completion every 3 seconds
                        const pollInterval = setInterval(() => {
                            router.reload({ only: ['session'] });
                        }, 3000);

                        // Stop polling after 5 minutes
                        setTimeout(() => clearInterval(pollInterval), 300000);
                    },
                    onError: () => {
                        Swal.fire({
                            title: 'Error!',
                            text: 'Failed to start placement. Please try again.',
                            icon: 'error'
                        });
                    }
                });
            }
        });
    };

    const handlePublishResults = () => {
        Swal.fire({
            title: 'Publish Results?',
            text: 'Once published, students will be able to view their assigned classes. Are you sure you want to proceed?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, publish',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.registration-sessions.publish', session.id), {}, {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Published!',
                            text: 'Results have been published. Students can now view their assigned classes.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    },
                    onError: () => {
                        Swal.fire({
                            title: 'Error!',
                            text: 'Failed to publish results. Please try again.',
                            icon: 'error'
                        });
                    }
                });
            }
        });
    };

    return (
        <AppLayout  title="Registration Session">
            <Head title={`Registration Session  - ${session.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            {/* Header */}
                            <div className="mb-8 flex items-center justify-between">
                                <div className="flex items-center">
                                    <Link
                                        href={route('semester-registration')}
                                        className="mr-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                    >
                                        <ArrowLeft className="h-6 w-6" />
                                    </Link>
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                                            <Calendar className="mr-3 h-8 w-8" />
                                            {session.name}
                                        </h1>
                                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                                            Registration session details and analytics
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Link
                                        href={route('admin.registration-sessions.projector', session.id)}
                                        target="_blank"
                                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Monitor className="mr-2 h-4 w-4" />
                                        Projector View
                                    </Link>

                                    {session.status === 'closed' && (
                                        <button
                                            onClick={handleStartPlacement}
                                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            <PlayCircle className="mr-2 h-4 w-4" />
                                            Start Placement
                                        </button>
                                    )}

                                    {session.status === 'processing' && (
                                        <div className="flex items-center px-4 py-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg">
                                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-yellow-600 border-t-transparent rounded-full"></div>
                                            Processing...
                                        </div>
                                    )}

                                    {session.status === 'placement' && (
                                        <>
                                            <Link
                                                href={route('admin.registration-sessions.placement.index', session.id)}
                                                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                            >
                                                <Settings className="mr-2 h-4 w-4" />
                                                Manage Placements
                                            </Link>
                                            <button
                                                onClick={handlePublishResults}
                                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                Publish Results
                                            </button>
                                        </>
                                    )}

                                    {session.status === 'published' && (
                                        <Link
                                            href={route('admin.registration-sessions.placement.index', session.id)}
                                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Placements
                                        </Link>
                                    )}

                                    {session.status !== 'closed' && session.status !== 'processing' && session.status !== 'placement' && session.status !== 'published' && (
                                        <button
                                            onClick={handleCloseSession}
                                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Close Session
                                        </button>
                                    )}

                                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(session.status)}`}>
                                        {session.status}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column - Session Info & QR */}
                                <div className="lg:col-span-1">
                                    {/* Session Information */}
                                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                            <Calendar className="mr-2 h-5 w-5" />
                                            Session Information
                                        </h2>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Duration
                                                </label>
                                                <div className="flex items-center mt-1">
                                                    <Clock className="mr-2 h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-900 dark:text-white">
                                                        {new Date(session.start_date).toLocaleDateString()} - {new Date(session.end_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Description
                                                </label>
                                                <p className="mt-1 text-gray-900 dark:text-white">
                                                    {session.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* QR Code */}
                                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                            <QrCode className="mr-2 h-5 w-5" />
                                            Registration QR Code
                                        </h2>

                                        <div className="text-center">
                                            <div className="bg-white p-4 rounded-lg inline-block">
                                                <QRCodeSVG
                                                    value={registrationLink}
                                                    size={200}
                                                    level="M"
                                                />
                                            </div>

                                            <div className="mt-4">
                                                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                                    <code className="text-sm text-gray-600 dark:text-gray-300 truncate flex-1">
                                                        {registrationLink}
                                                    </code>
                                                    <button
                                                        onClick={() => copyToClipboard(registrationLink)}
                                                        className={`ml-2 p-2 transition-colors ${
                                                            isCopied
                                                                ? 'text-green-600 dark:text-green-400'
                                                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                                        }`}
                                                        title={isCopied ? 'Copied!' : 'Copy to clipboard'}
                                                    >
                                                        {isCopied ? (
                                                            <Check className="h-4 w-4" />
                                                        ) : (
                                                            <Copy className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Classes & Students */}
                                <div className="lg:col-span-2">
                                    {/* Classes List with Quota */}
                                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
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
                                                                Track
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                Quota Balance
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                Total Quota
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
                                                                            {classItem.registration_session_track.track.name}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="flex items-center">
                                                                            <Target className="mr-1 h-4 w-4 text-gray-400" />
                                                                            <span className={`font-medium ${isFullyBooked ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                                                                                {availableSlots}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="flex items-center">
                                                                            <Users className="mr-1 h-4 w-4 text-gray-400" />
                                                                            <span className="text-gray-900 dark:text-white">
                                                                                {classItem.quota}
                                                                            </span>
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
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                                <BookOpen className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                                                <p>No classes available for this session.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Registered Students List */}
                                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                                                <User className="mr-2 h-5 w-5" />
                                                Registered Students ({students.length})
                                            </h2>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setIsAddStudentModalOpen(true)}
                                                    className="flex items-center px-3 py-2 text-sm font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900 rounded-md hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                                                >
                                                    <UserPlus className="mr-2 h-4 w-4" />
                                                    Add Student
                                                </button>

                                                <div className="relative" ref={dropdownRef}>
                                                    <button
                                                        onClick={() => setIsActionsDropdownOpen(!isActionsDropdownOpen)}
                                                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                                                    >
                                                        <MoreVertical className="mr-2 h-4 w-4" />
                                                        Actions
                                                        <ChevronDown className="ml-1 h-4 w-4" />
                                                    </button>

                                                    {isActionsDropdownOpen && (
                                                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                                                            <div className="py-1">
                                                                <Link
                                                                    href={route('admin.registration-sessions.bulk-upload', session.id)}
                                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                                    onClick={() => setIsActionsDropdownOpen(false)}
                                                                >
                                                                    <Upload className="mr-3 h-4 w-4 text-blue-500" />
                                                                    Bulk Upload
                                                                </Link>

                                                                {students.length > 0 && (
                                                                    <>
                                                                        <Link
                                                                            href={route('admin.registration-sessions.export.excel', session.id)}
                                                                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                                            onClick={() => setIsActionsDropdownOpen(false)}
                                                                        >
                                                                            <FileSpreadsheet className="mr-3 h-4 w-4 text-green-500" />
                                                                            Export Excel
                                                                        </Link>
                                                                        <Link
                                                                            href={route('admin.registration-sessions.export.pdf', session.id)}
                                                                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                                            onClick={() => setIsActionsDropdownOpen(false)}
                                                                        >
                                                                            <FileText className="mr-3 h-4 w-4 text-red-500" />
                                                                            Export PDF
                                                                        </Link>
                                                                    </>
                                                                )}

                                                                <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>

                                                                <button
                                                                    onClick={() => {
                                                                        setIsActionsDropdownOpen(false);
                                                                        handleGenerateTestStudent();
                                                                    }}
                                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                                                                >
                                                                    <User className="mr-3 h-4 w-4 text-green-500" />
                                                                    Generate Test Student
                                                                </button>

                                                                <button
                                                                    onClick={() => {
                                                                        setIsActionsDropdownOpen(false);
                                                                        handleGenerateDummyStudent();
                                                                    }}
                                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                                                                >
                                                                    <Sparkles className="mr-3 h-4 w-4 text-purple-500" />
                                                                    Generate Dummy Student
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

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
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                Actions
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
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="flex items-center gap-2">
                                                                        {student.is_submitted ? (
                                                                            <button
                                                                                onClick={() => handleUndoSubmission(student.id, student.name)}
                                                                                className="flex items-center px-3 py-1 text-sm font-medium text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900 rounded-md hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors"
                                                                                title="Undo submission"
                                                                            >
                                                                                <RotateCcw className="mr-1 h-3 w-3" />
                                                                                Undo
                                                                            </button>
                                                                        ) : (
                                                                            <button
                                                                                onClick={() => handleDeleteStudent(student.id, student.name)}
                                                                                className="flex items-center px-3 py-1 text-sm font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 rounded-md hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                                                                                title="Delete student"
                                                                            >
                                                                                <Trash2 className="mr-1 h-3 w-3" />
                                                                                Delete
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
            </div>

            <AddSingleStudentModal
                isOpen={isAddStudentModalOpen}
                onClose={() => setIsAddStudentModalOpen(false)}
                sessionId={session.id}
            />
        </AppLayout>
    );
}
