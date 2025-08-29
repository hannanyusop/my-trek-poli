import { Link } from '@inertiajs/react';
import LandingLayout from '@/Layouts/LandingLayout';

export default function Welcome() {
    return (
        <LandingLayout title="Welcome">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                            Welcome to <span className="text-indigo-600 dark:text-indigo-400">MyTrek</span>
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                            Your ultimate journey management platform. Track your adventures, plan your routes, and connect with fellow travelers.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href={route('register')}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors shadow-lg"
                            >
                                Start Your Journey
                            </Link>
                            <Link
                                href={route('login')}
                                className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Powerful Features
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            Everything you need to manage your journeys effectively
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Route Planning</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Plan your perfect route with our intuitive mapping tools and get real-time updates.
                            </p>
                        </div>

                        <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Journey Analytics</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Track your progress, analyze your journeys, and discover insights about your travels.
                            </p>
                        </div>

                        <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Community</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Connect with fellow travelers, share experiences, and discover new destinations.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Technology Stack Section */}
            <section className="py-20 bg-gray-50 dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Built with Modern Technology
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            Powered by cutting-edge technologies for the best experience
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm text-center">
                            <div className="text-2xl font-bold text-red-600 mb-2">Laravel</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">v12</div>
                        </div>
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm text-center">
                            <div className="text-2xl font-bold text-blue-600 mb-2">React</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">v19</div>
                        </div>
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm text-center">
                            <div className="text-2xl font-bold text-purple-600 mb-2">Inertia</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">v2</div>
                        </div>
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm text-center">
                            <div className="text-2xl font-bold text-blue-400 mb-2">TypeScript</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Latest</div>
                        </div>
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm text-center">
                            <div className="text-2xl font-bold text-cyan-500 mb-2">Tailwind</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">v4</div>
                        </div>
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm text-center">
                            <div className="text-2xl font-bold text-green-600 mb-2">Pest</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">v4</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-indigo-600 dark:bg-indigo-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Ready to Start Your Journey?
                    </h2>
                    <p className="text-xl text-indigo-100 mb-8">
                        Join thousands of travelers who trust MyTrek for their adventures
                    </p>
                    <Link
                        href={route('register')}
                        className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-semibold transition-colors shadow-lg"
                    >
                        Get Started Today
                    </Link>
                </div>
            </section>
        </LandingLayout>
    );
}