import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowLeft, Download, Upload, AlertCircle, CheckCircle, FileSpreadsheet, Eye } from 'lucide-react';
import { useState } from 'react';

interface RegistrationSession {
    id: number;
    name: string;
    status: string;
    start_date: string;
    end_date: string;
    description: string;
    link_token: string;
}

interface PreviewStudent {
    row_number: number;
    data: {
        matric_number: string;
        identification_number: string;
        name: string;
        gender: string;
        race: string;
        religion: string;
        email: string;
        phone: string;
    };
    has_errors: boolean;
}

interface Props {
    session: RegistrationSession;
    previewData?: PreviewStudent[];
    errors?: Record<number, string[]>;
    showPreview?: boolean;
}

export default function BulkUpload({ session, previewData = [], errors = {}, showPreview = false }: Props) {
    const { data, setData, post, processing, errors: formErrors, reset } = useForm({
        file: null as File | null,
        students_data: [] as any[]
    });

    const [dragActive, setDragActive] = useState(false);

    const handleFileSelect = (file: File) => {
        setData('file', file);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const processUpload = () => {
        if (!data.file) return;

        post(route('admin.registration-sessions.process-upload', session.id), {
            forceFormData: true,
        });
    };

    const confirmUpload = () => {
        const validStudentsData = previewData
            .filter(item => !item.has_errors)
            .map(item => item.data);

        router.post(route('admin.registration-sessions.confirm-upload', session.id), {
            students_data: validStudentsData
        });
    };

    const hasErrors = Object.keys(errors).length > 0;
    const validRecordsCount = previewData.filter(item => !item.has_errors).length;

    return (
        <AppLayout title="Bulk Upload">
            <Head title={`Bulk Upload - ${session.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            {/* Header */}
                            <div className="mb-8 flex items-center justify-between">
                                <div className="flex items-center">
                                    <Link
                                        href={route('admin.registration-sessions.show', session.id)}
                                        className="mr-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                    >
                                        <ArrowLeft className="h-6 w-6" />
                                    </Link>
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                                            <Upload className="mr-3 h-8 w-8" />
                                            Bulk Upload Students
                                        </h1>
                                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                                            Upload students for {session.name}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {!showPreview ? (
                                <div className="space-y-6">
                                    {/* Instructions */}
                                    <div className="rounded-lg border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 p-6">
                                        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
                                            <FileSpreadsheet className="mr-2 h-5 w-5" />
                                            Instructions
                                        </h2>
                                        <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-200">
                                            <li>Download the Excel template with the correct column headers</li>
                                            <li>Fill in the student data following the template format</li>
                                            <li>Upload the completed file for preview and validation</li>
                                            <li>Review the data and confirm to save to database</li>
                                        </ol>
                                    </div>

                                    {/* Download Template */}
                                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                            Step 1: Download Template
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                                            Download the CSV template with pre-defined headers based on the students table structure.
                                        </p>
                                        <a
                                            href={route('admin.registration-sessions.download-template', session.id)}
                                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-fit"
                                            download
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Download CSV Template
                                        </a>
                                    </div>

                                    {/* File Upload */}
                                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                            Step 2: Upload File
                                        </h2>

                                        <div
                                            className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                                                dragActive
                                                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                            }`}
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                        >
                                            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                                                Drag and drop your CSV file here, or click to browse
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                                Supported formats: .csv (Max 2MB)
                                            </p>

                                            <input
                                                type="file"
                                                accept=".csv"
                                                onChange={handleFileInput}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />

                                            <button
                                                type="button"
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                                            >
                                                Choose File
                                            </button>
                                        </div>

                                        {data.file && (
                                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <FileSpreadsheet className="mr-2 h-5 w-5 text-green-600" />
                                                    <span className="text-gray-900 dark:text-white">
                                                        {data.file.name} ({(data.file.size / 1024 / 1024).toFixed(2)} MB)
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={processUpload}
                                                    disabled={processing}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                                >
                                                    {processing ? 'Processing...' : 'Process File'}
                                                </button>
                                            </div>
                                        )}

                                        {formErrors.file && (
                                            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                                                <p className="text-red-800 dark:text-red-200 text-sm">{formErrors.file}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                /* Preview Section */
                                <div className="space-y-6">
                                    {/* Summary */}
                                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                            <Eye className="mr-2 h-5 w-5" />
                                            Upload Preview
                                        </h2>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                                <div className="text-blue-600 dark:text-blue-400 text-2xl font-bold">
                                                    {previewData.length}
                                                </div>
                                                <div className="text-blue-800 dark:text-blue-200 text-sm">
                                                    Total Records
                                                </div>
                                            </div>
                                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                                <div className="text-green-600 dark:text-green-400 text-2xl font-bold">
                                                    {validRecordsCount}
                                                </div>
                                                <div className="text-green-800 dark:text-green-200 text-sm">
                                                    Valid Records
                                                </div>
                                            </div>
                                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                                                <div className="text-red-600 dark:text-red-400 text-2xl font-bold">
                                                    {previewData.length - validRecordsCount}
                                                </div>
                                                <div className="text-red-800 dark:text-red-200 text-sm">
                                                    Records with Errors
                                                </div>
                                            </div>
                                        </div>

                                        {hasErrors && (
                                            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                                                <div className="flex items-center mb-2">
                                                    <AlertCircle className="mr-2 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                                    <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                                                        Some records have validation errors and will be skipped.
                                                    </p>
                                                </div>
                                                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                                                    Only {validRecordsCount} valid records will be imported.
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => router.visit(route('admin.registration-sessions.bulk-upload', session.id))}
                                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                            >
                                                Upload Different File
                                            </button>
                                            {validRecordsCount > 0 && (
                                                <button
                                                    onClick={confirmUpload}
                                                    disabled={processing}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                                >
                                                    {processing ? 'Importing...' : `Import ${validRecordsCount} Students`}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Preview Table */}
                                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                            Data Preview
                                        </h3>

                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead className="bg-gray-50 dark:bg-gray-700">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Row
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Matric Number
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            IC/Passport
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Name
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Gender
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Race
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Religion
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Email
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Phone
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Errors
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                    {previewData.map((item) => (
                                                        <tr key={item.row_number} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${item.has_errors ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                                {item.row_number}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                {item.has_errors ? (
                                                                    <span className="flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">
                                                                        <AlertCircle className="mr-1 h-3 w-3" />
                                                                        Error
                                                                    </span>
                                                                ) : (
                                                                    <span className="flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                                                                        <CheckCircle className="mr-1 h-3 w-3" />
                                                                        Valid
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                                                                {item.data.matric_number || '-'}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                                {item.data.identification_number || '-'}
                                                            </td>
                                                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                                                                {item.data.name || '-'}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                    item.data.gender?.toLowerCase() === 'male'
                                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                                        : item.data.gender?.toLowerCase() === 'female'
                                                                        ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
                                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                                                }`}>
                                                                    {item.data.gender || '-'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                                {item.data.race || '-'}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                                {item.data.religion || '-'}
                                                            </td>
                                                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                                                                {item.data.email || '-'}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                                                                {item.data.phone || '-'}
                                                            </td>
                                                            <td className="px-4 py-4 text-sm">
                                                                {errors[item.row_number] && (
                                                                    <div className="space-y-1 max-w-xs">
                                                                        {errors[item.row_number].map((error, index) => (
                                                                            <div key={index} className="text-red-600 dark:text-red-400 text-xs bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                                                                                {error}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
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
