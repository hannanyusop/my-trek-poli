import { Head } from '@inertiajs/react';

interface RegistrationSession {
    id: number;
    name: string;
    description: string;
    link_token: string;
    start_date: string;
    end_date: string;
    status: 'draft' | 'open' | 'closed' | 'processing' | 'placement' | 'published';
}

interface Props {
    registrationSession: RegistrationSession;
    status: 'draft' | 'closed' | 'processing' | 'placement';
    title: string;
    message: string;
    description: string;
    icon: 'clock' | 'lock' | 'spinner' | 'review';
}

export default function SessionStatus({ registrationSession, status, title, message, description, icon }: Props) {
    const getIcon = () => {
        switch (icon) {
            case 'clock':
                return (
                    <svg className="h-12 w-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'lock':
                return (
                    <svg className="h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                );
            case 'spinner':
                return (
                    <div className="relative">
                        <svg className="h-12 w-12 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                );
            case 'review':
                return (
                    <svg className="h-12 w-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const getBackgroundColor = () => {
        switch (status) {
            case 'draft':
                return 'from-amber-50 to-orange-100 dark:from-gray-900 dark:to-amber-900/20';
            case 'closed':
                return 'from-red-50 to-rose-100 dark:from-gray-900 dark:to-red-900/20';
            case 'processing':
                return 'from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900/20';
            case 'placement':
                return 'from-purple-50 to-violet-100 dark:from-gray-900 dark:to-purple-900/20';
            default:
                return 'from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800';
        }
    };

    const getIconBackgroundColor = () => {
        switch (status) {
            case 'draft':
                return 'bg-amber-100 dark:bg-amber-900/30';
            case 'closed':
                return 'bg-red-100 dark:bg-red-900/30';
            case 'processing':
                return 'bg-blue-100 dark:bg-blue-900/30';
            case 'placement':
                return 'bg-purple-100 dark:bg-purple-900/30';
            default:
                return 'bg-gray-100 dark:bg-gray-800';
        }
    };

    const getStatusBadgeColor = () => {
        switch (status) {
            case 'draft':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
            case 'closed':
                return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
            case 'processing':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
            case 'placement':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-MY', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${getBackgroundColor()} py-12 px-4 sm:px-6 lg:px-8`}>
            <Head title={`${title} - ${registrationSession.name}`} />

            <div className="max-w-lg w-full">
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl px-8 py-10 border border-gray-100 dark:border-gray-700">
                    {/* Icon */}
                    <div className={`mx-auto h-24 w-24 ${getIconBackgroundColor()} rounded-full flex items-center justify-center mb-6`}>
                        {getIcon()}
                    </div>

                    {/* Title & Message */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            {title}
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                            {message}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {description}
                        </p>
                    </div>

                    {/* Session Details */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Session Information
                        </h2>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Session Name:</span>
                                <span className="text-sm text-gray-900 dark:text-white font-medium">{registrationSession.name}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor()}`}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date:</span>
                                <span className="text-sm text-gray-900 dark:text-white">{formatDate(registrationSession.start_date)}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">End Date:</span>
                                <span className="text-sm text-gray-900 dark:text-white">{formatDate(registrationSession.end_date)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Help Section */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                    Need Help?
                                </h3>
                                <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                                    If you have any questions or need assistance, please contact your administrator or the registration office.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <span>Your information is secure and protected</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
