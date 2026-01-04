import { Head, Link } from '@inertiajs/react';
import { Form } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Shield, ArrowLeft } from 'lucide-react';
import { Permission, Role } from '@/types';

interface Props {
    role: Role;
    permissions: Permission[];
}

export default function EditRole({ role, permissions }: Props) {
    const rolePermissions = role.permissions?.map(p => p.name) || [];

    return (
        <AppLayout>
            <Head title={`Edit Role: ${role.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                                        <Shield className="mr-3 h-8 w-8" />
                                        Edit Role
                                    </h1>
                                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                                        Update role details and permissions
                                    </p>
                                </div>

                                <Link
                                    href={route('admin.roles.index')}
                                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Roles
                                </Link>
                            </div>

                            <Form
                                action={route('admin.roles.update', role.id)}
                                method="put"
                                defaults={{ name: role.name, permissions: rolePermissions }}
                            >
                                {({ data, setData, errors, processing }) => (
                                    <div className="space-y-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Role Name *
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={data.name || ''}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                placeholder="e.g., Manager, Editor, Viewer"
                                                required
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                                Permissions
                                            </label>
                                            {permissions.length > 0 ? (
                                                <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                                    {permissions.map((permission) => (
                                                        <label key={permission.id} className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                name="permissions[]"
                                                                value={permission.name}
                                                                checked={data.permissions?.includes(permission.name) || false}
                                                                onChange={(e) => {
                                                                    const currentPermissions = data.permissions || [];
                                                                    if (e.target.checked) {
                                                                        setData('permissions', [...currentPermissions, permission.name]);
                                                                    } else {
                                                                        setData('permissions', currentPermissions.filter((p: string) => p !== permission.name));
                                                                    }
                                                                }}
                                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                                                                {permission.name}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    No permissions available. Create permissions first.
                                                </p>
                                            )}
                                            {errors.permissions && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.permissions}</p>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-end space-x-4">
                                            <Link
                                                href={route('admin.roles.index')}
                                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                                            >
                                                Cancel
                                            </Link>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {processing ? 'Updating...' : 'Update Role'}
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
