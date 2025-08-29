import { Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { User, DashboardStats, StudentWithRelations, RegistrationSessionWithTracks } from '@/types';

interface DashboardProps {
    auth: { user: User };
    stats: DashboardStats;
    recent_sessions: RegistrationSessionWithTracks[];
    recent_registrations: StudentWithRelations[];
}

export default function Dashboard() {
    const { auth, stats, recent_sessions, recent_registrations } = usePage<DashboardProps>().props;
    const handleLogout = () => {
        router.post(route('logout'));
    };

    return (
        <AppLayout title="Dashboard">
            <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Welcome back, {auth.user.name}!
                            </h1>
                            <p className="text-gray-600">
                                You're logged in as {auth.user.email}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Logout
                        </button>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600">Total Users</p>
                                    <p className="text-2xl font-bold text-blue-900">{stats.total_users}</p>
                                </div>
                                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600">Total Students</p>
                                    <p className="text-2xl font-bold text-green-900">{stats.total_students}</p>
                                </div>
                                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-600">Total Tracks</p>
                                    <p className="text-2xl font-bold text-purple-900">{stats.total_tracks}</p>
                                </div>
                                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-orange-50 p-6 rounded-lg border border-orange-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-orange-600">Active Sessions</p>
                                    <p className="text-2xl font-bold text-orange-900">{stats.active_sessions}</p>
                                </div>
                                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-teal-50 p-6 rounded-lg border border-teal-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-teal-600">Registrations</p>
                                    <p className="text-2xl font-bold text-teal-900">{stats.total_registrations}</p>
                                </div>
                                <div className="w-8 h-8 bg-teal-500 rounded-md flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Admin Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Link
                            href={route('admin.users.index')}
                            className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors group"
                        >
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">Manage Users</h3>
                                    <p className="text-sm text-gray-600">View and manage system users</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href={route('admin.registration-sessions.index')}
                            className="bg-green-50 p-6 rounded-lg border border-green-100 hover:bg-green-100 transition-colors group"
                        >
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">Registration Sessions</h3>
                                    <p className="text-sm text-gray-600">Manage registration periods</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href={route('admin.tracks.index')}
                            className="bg-purple-50 p-6 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors group"
                        >
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">Manage Tracks</h3>
                                    <p className="text-sm text-gray-600">Configure course tracks</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href={route('semester-registration')}
                            className="bg-yellow-50 p-6 rounded-lg border border-yellow-100 hover:bg-yellow-100 transition-colors group"
                        >
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center group-hover:bg-yellow-600 transition-colors">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">Semester Registration</h3>
                                    <p className="text-sm text-gray-600">View active registrations</p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Recent Activity */}
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Recent Sessions */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Registration Sessions</h2>
                            <div className="space-y-3">
                                {recent_sessions.length > 0 ? (
                                    recent_sessions.map((session) => (
                                        <Link
                                            key={session.id}
                                            href={route('admin.registration-sessions.show', session.id)}
                                            className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{session.name}</h3>
                                                    <p className="text-sm text-gray-600">Status: <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                                        session.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        session.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>{session.status}</span></p>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {session.tracks.length} track{session.tracks.length !== 1 ? 's' : ''} available
                                                    </p>
                                                </div>
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        No recent sessions found
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Registrations */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Registrations</h2>
                            <div className="space-y-3">
                                {recent_registrations.length > 0 ? (
                                    recent_registrations.map((student) => (
                                        <div
                                            key={student.id}
                                            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-gray-900">{student.name}</h3>
                                                    <p className="text-sm text-gray-600">{student.matric_number}</p>
                                                    <div className="flex gap-4 mt-1 text-xs text-gray-500">
                                                        {student.race && <span>Race: {student.race.name}</span>}
                                                        {student.religion && <span>Religion: {student.religion.name}</span>}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">
                                                        {student.submitted_at && new Date(student.submitted_at).toLocaleDateString()}
                                                    </p>
                                                    <span className="inline-flex px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 mt-1">
                                                        Registered
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                        No recent registrations found
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}