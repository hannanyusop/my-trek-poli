import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Calendar, Users, BookOpen, Clock, ArrowLeft, QrCode, ExternalLink, User, Target, Monitor, RotateCcw, FileSpreadsheet, FileText, Download, Upload } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { RegistrationSession, Student, Class } from '@/types';
import { getStatusColor } from '@/lib/utils';

interface Props {
    session: RegistrationSession;
    classes: Class[];
    students: Student[];
    registrationLink: string;
}

export default function Show({ session, classes, students, registrationLink }: Props) {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const handleUndoSubmission = (studentId: number, studentName: string) => {
        if (confirm(`Are you sure you want to undo the submission for ${studentName}? This will reset their submission status to pending.`)) {
            router.post(route('admin.registration-sessions.undo-submission', session.id), {
                student_id: studentId,
            });
        }
    };

    return (
        <AppLayout>
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
                                                        className="ml-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                                        title="Copy to clipboard"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
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
                                                <Link
                                                    href={route('admin.registration-sessions.bulk-upload', session.id)}
                                                    className="flex items-center px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                                                >
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Bulk Upload
                                                </Link>
                                                {students.length > 0 && (
                                                    <>
                                                        <Link
                                                            href={route('admin.registration-sessions.export.excel', session.id)}
                                                            className="flex items-center px-3 py-2 text-sm font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900 rounded-md hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                                                        >
                                                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                                                            Export Excel
                                                        </Link>
                                                        <Link
                                                            href={route('admin.registration-sessions.export.pdf', session.id)}
                                                            className="flex items-center px-3 py-2 text-sm font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 rounded-md hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                                                        >
                                                            <FileText className="mr-2 h-4 w-4" />
                                                            Export PDF
                                                        </Link>
                                                    </>
                                                )}
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
                                                                    {student.is_submitted && (
                                                                        <button
                                                                            onClick={() => handleUndoSubmission(student.id, student.name)}
                                                                            className="flex items-center px-3 py-1 text-sm font-medium text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900 rounded-md hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors"
                                                                            title="Undo submission"
                                                                        >
                                                                            <RotateCcw className="mr-1 h-3 w-3" />
                                                                            Undo
                                                                        </button>
                                                                    )}
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
        </AppLayout>
    );
}
