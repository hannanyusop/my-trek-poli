import { Head } from '@inertiajs/react';
import { Users, Calendar, Shield } from 'lucide-react';

interface MaskedStudent {
    queue_number: number;
    name: string;
    matric_number: string;
    identification_number: string;
    gender: string;
    submitted_at: string;
}

interface Props {
    session: {
        id: number;
        name: string;
        status: string;
    };
    students: MaskedStudent[];
    totalStudents: number;
}

export default function StudentList({ session, students, totalStudents }: Props) {
    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            draft: 'bg-gray-100 text-gray-800',
            open: 'bg-green-100 text-green-800',
            closed: 'bg-red-100 text-red-800',
            processing: 'bg-yellow-100 text-yellow-800',
            placement: 'bg-blue-100 text-blue-800',
            published: 'bg-purple-100 text-purple-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <>
            <Head title={`Registered Students - ${session.name}`} />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                {/* Header */}
                <header className="bg-white shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                    <Users className="mr-3 h-7 w-7 text-blue-600" />
                                    Registered Students
                                </h1>
                                <p className="mt-1 text-gray-600">{session.name}</p>
                            </div>
                            <span className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${getStatusColor(session.status)}`}>
                                {session.status}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Privacy Notice */}
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start">
                            <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <h3 className="text-sm font-medium text-blue-800">
                                    Privacy Protected
                                </h3>
                                <p className="text-sm text-blue-700 mt-1">
                                    Identification numbers are partially masked to protect student privacy.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center">
                                <Users className="h-8 w-8 text-green-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Total Registered</p>
                                    <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center">
                                <Calendar className="h-8 w-8 text-blue-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Session Status</p>
                                    <p className="text-lg font-bold text-gray-900 capitalize">{session.status}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center">
                                <Shield className="h-8 w-8 text-purple-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Privacy</p>
                                    <p className="text-lg font-bold text-gray-900">Protected</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Students Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Student List
                            </h2>
                        </div>

                        {students.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                #
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                IC Number
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Gender
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Registered At
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {students.map((student) => (
                                            <tr key={student.queue_number} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                                                        {student.queue_number}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {student.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded font-mono">
                                                        {student.identification_number}
                                                    </code>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        student.gender === 'male'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-pink-100 text-pink-800'
                                                    }`}>
                                                        {student.gender === 'male' ? 'Male' : 'Female'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {new Date(student.submitted_at).toLocaleString()}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <Users className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                                <p className="text-lg font-medium">No registered students yet</p>
                                <p className="text-sm mt-1">Students who have submitted their registration will appear here.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center text-sm text-gray-500">
                        <p>MyTrek Registration System</p>
                    </div>
                </main>
            </div>
        </>
    );
}
