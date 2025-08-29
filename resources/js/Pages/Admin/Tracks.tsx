import { Head, Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import AppLayout from '@/Layouts/AppLayout';
import { Settings, Plus, Search, Edit, Trash2, BookOpen } from 'lucide-react';

interface Track {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    tracks: Track[];
}

export default function Tracks({ tracks = [] }: Props) {
    const handleDelete = (trackId: number, trackName: string) => {
        Swal.fire({
            title: 'Delete Track',
            html: `Are you sure you want to delete <strong>"${trackName}"</strong>?<br><br>This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            focusCancel: true,
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.tracks.destroy', trackId), {
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
                            toast.error('Failed to delete track. Please try again.');
                        }
                    }
                });
            }
        });
    };
    return (
        <AppLayout>
            <Head title="Tracks Management" />
            
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                                        <Settings className="mr-3 h-8 w-8" />
                                        Tracks Management
                                    </h1>
                                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                                        Manage academic tracks, courses, and curriculum
                                    </p>
                                </div>
                                
                                <Link
                                    href={route('admin.tracks.create')}
                                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Track
                                </Link>
                            </div>

                            <div className="mb-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search tracks..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                {tracks.map((track) => (
                                    <div key={track.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-4">
                                            <BookOpen className="h-8 w-8 text-indigo-600" />
                                            <div className="flex space-x-2">
                                                <Link
                                                    href={route('admin.tracks.edit', track.id)}
                                                    className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
                                                    title="Edit track"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(track.id, track.name)}
                                                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                                                    title="Delete track"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            {track.name}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                            {track.description}
                                        </p>
                                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                            <span>Created {new Date(track.created_at).toLocaleDateString()}</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                track.is_active 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                            }`}>
                                                {track.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                <Link
                                    href={route('admin.tracks.create')}
                                    className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 flex items-center justify-center hover:border-indigo-400 transition-colors cursor-pointer"
                                >
                                    <div className="text-center">
                                        <Plus className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                            Add new track
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