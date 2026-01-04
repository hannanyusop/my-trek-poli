import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { UserCheck, Plus, Search, Shield, Users, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Role, Permission } from '@/types';

interface Props {
    roles: Role[];
    permissions: Permission[];
}

export default function Roles({ roles, permissions }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = (roleId: number) => {
        router.delete(route('admin.roles.destroy', roleId), {
            onSuccess: () => setDeleteConfirm(null),
        });
    };

    const getRoleColor = (roleName: string) => {
        const colors: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
            admin: { bg: 'bg-red-100', text: 'text-red-600', darkBg: 'dark:bg-red-900', darkText: 'dark:text-red-400' },
            student: { bg: 'bg-blue-100', text: 'text-blue-600', darkBg: 'dark:bg-blue-900', darkText: 'dark:text-blue-400' },
            default: { bg: 'bg-gray-100', text: 'text-gray-600', darkBg: 'dark:bg-gray-700', darkText: 'dark:text-gray-400' },
        };
        return colors[roleName.toLowerCase()] || colors.default;
    };

    return (
        <AppLayout>
            <Head title="Roles Management" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                                        <UserCheck className="mr-3 h-8 w-8" />
                                        Roles Management
                                    </h1>
                                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                                        Manage user roles and permissions across the system
                                    </p>
                                </div>

                                <Link
                                    href={route('admin.roles.create')}
                                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Role
                                </Link>
                            </div>

                            <div className="mb-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search roles..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                                {filteredRoles.map((role) => {
                                    const color = getRoleColor(role.name);
                                    return (
                                        <div
                                            key={role.id}
                                            className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`p-3 ${color.bg} ${color.darkBg} rounded-lg`}>
                                                    <Shield className={`h-6 w-6 ${color.text} ${color.darkText}`} />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={route('admin.roles.edit', role.id)}
                                                        className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Link>
                                                    {deleteConfirm === role.id ? (
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => handleDelete(role.id)}
                                                                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirm(null)}
                                                                className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setDeleteConfirm(role.id)}
                                                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 capitalize">
                                                {role.name}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                                {role.permissions && role.permissions.length > 0
                                                    ? `${role.permissions.length} permission${role.permissions.length > 1 ? 's' : ''}`
                                                    : 'No permissions assigned'}
                                            </p>
                                            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center">
                                                    <Users className="mr-1 h-4 w-4" />
                                                    {role.users_count || 0} user{(role.users_count || 0) !== 1 ? 's' : ''}
                                                </span>
                                                {role.permissions && role.permissions.length > 0 && (
                                                    <span className="text-xs text-gray-400">
                                                        {role.permissions.slice(0, 2).map(p => p.name).join(', ')}
                                                        {role.permissions.length > 2 && ` +${role.permissions.length - 2}`}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                <Link
                                    href={route('admin.roles.create')}
                                    className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 flex items-center justify-center hover:border-indigo-400 transition-colors cursor-pointer"
                                >
                                    <div className="text-center">
                                        <Plus className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                            Create new role
                                        </p>
                                    </div>
                                </Link>
                            </div>

                            {permissions.length > 0 && (
                                <div className="mt-8">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                        Available Permissions
                                    </h2>
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                        <div className="flex flex-wrap gap-2">
                                            {permissions.map((permission) => (
                                                <span
                                                    key={permission.id}
                                                    className="px-3 py-1 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-full text-sm text-gray-700 dark:text-gray-300"
                                                >
                                                    {permission.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
