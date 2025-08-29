import { Head, Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import AppLayout from '@/Layouts/AppLayout';
import { Church, Plus, Search, Edit, Trash2 } from 'lucide-react';

interface Religion {
    id: number;
    name: string;
    code: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    religions: Religion[];
}

export default function Religions({ religions = [] }: Props) {
    const handleDelete = (religionId: number, religionName: string) => {
        Swal.fire({
            title: 'Delete Religion',
            html: `Are you sure you want to delete <strong>"${religionName}"</strong>?<br><br>This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            focusCancel: true,
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.religions.destroy', religionId), {
                    onSuccess: () => {
                        // Success message will be handled by the backend flash message
                    },
                    onError: (errors) => {
                        if (Object.keys(errors).length > 0) {
                            Object.values(errors).forEach((error) => {
                                if (typeof error === 'string') {
                                    toast.error(error);
                                }
                            });
                        } else {
                            toast.error('Failed to delete religion. Please try again.');
                        }
                    }
                });
            }
        });
    };
    
    return (
        <AppLayout>
            <Head title="Religions Management" />
            
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                                        <Church className="mr-3 h-8 w-8" />
                                        Religions Management
                                    </h1>
                                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                                        Manage religion categories for demographic data
                                    </p>
                                </div>
                                
                                <Link
                                    href={route('admin.religions.create')}
                                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Religion
                                </Link>
                            </div>

                            <div className="mb-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search religions..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                {religions.map((religion) => (
                                    <div key={religion.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-4">
                                            <Church className="h-8 w-8 text-indigo-600" />
                                            <div className="flex space-x-2">
                                                <Link
                                                    href={route('admin.religions.edit', religion.id)}
                                                    className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
                                                    title="Edit religion"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(religion.id, religion.name)}
                                                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                                                    title="Delete religion"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            {religion.name}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                            Code: {religion.code}
                                        </p>
                                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                            <span>Created {new Date(religion.created_at).toLocaleDateString()}</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                religion.is_active 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                            }`}>
                                                {religion.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                <Link
                                    href={route('admin.religions.create')}
                                    className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 flex items-center justify-center hover:border-indigo-400 transition-colors cursor-pointer"
                                >
                                    <div className="text-center">
                                        <Plus className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                            Add new religion
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}