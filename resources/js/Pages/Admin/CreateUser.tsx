import { Head, Link } from '@inertiajs/react';
import { Form } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { UserPlus, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface Role {
    id: number;
    name: string;
}

interface Props {
    roles: Role[];
}

export default function CreateUser({ roles }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    return (
        <AppLayout>
            <Head title="Create User" />
            
            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                                        <UserPlus className="mr-3 h-8 w-8" />
                                        Create New User
                                    </h1>
                                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                                        Add a new user to the system
                                    </p>
                                </div>
                                
                                <Link
                                    href={route('admin.users.index')}
                                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Users
                                </Link>
                            </div>

                            <Form action={route('admin.users.store')} method="post">
                                {({ data, setData, errors, processing }) => (
                                    <div className="space-y-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Name *
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={data.name || ''}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                required
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={data.email || ''}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                required
                                            />
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Password *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    id="password"
                                                    name="password"
                                                    value={data.password || ''}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3 mt-1"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-gray-400" />
                                                    )}
                                                </button>
                                            </div>
                                            {errors.password && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Confirm Password *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswordConfirmation ? 'text' : 'password'}
                                                    id="password_confirmation"
                                                    name="password_confirmation"
                                                    value={data.password_confirmation || ''}
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3 mt-1"
                                                >
                                                    {showPasswordConfirmation ? (
                                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-gray-400" />
                                                    )}
                                                </button>
                                            </div>
                                            {errors.password_confirmation && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password_confirmation}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                                Roles
                                            </label>
                                            <div className="space-y-2">
                                                {roles.map((role) => (
                                                    <label key={role.id} className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            name="roles[]"
                                                            value={role.name}
                                                            checked={data.roles?.includes(role.name) || false}
                                                            onChange={(e) => {
                                                                const currentRoles = data.roles || [];
                                                                if (e.target.checked) {
                                                                    setData('roles', [...currentRoles, role.name]);
                                                                } else {
                                                                    setData('roles', currentRoles.filter(r => r !== role.name));
                                                                }
                                                            }}
                                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-900 dark:text-gray-100 capitalize">
                                                            {role.name}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                            {errors.roles && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.roles}</p>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-end space-x-4">
                                            <Link
                                                href={route('admin.users.index')}
                                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                                            >
                                                Cancel
                                            </Link>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {processing ? 'Creating...' : 'Create User'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}