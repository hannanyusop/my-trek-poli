import { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import { Calendar, IdCard, Moon, Search, Shield, Sun, Users } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';

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

const statusStyles: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700',
    open: 'bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:ring-emerald-800',
    closed: 'bg-red-100 text-red-700 ring-red-200 dark:bg-red-950/60 dark:text-red-200 dark:ring-red-800',
    processing: 'bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-200 dark:ring-amber-800',
    placement: 'bg-blue-100 text-blue-700 ring-blue-200 dark:bg-blue-950/60 dark:text-blue-200 dark:ring-blue-800',
    published: 'bg-violet-100 text-violet-700 ring-violet-200 dark:bg-violet-950/60 dark:text-violet-200 dark:ring-violet-800',
};

export default function StudentList({ session, students, totalStudents }: Props) {
    const { theme, toggleTheme } = useTheme();
    const [query, setQuery] = useState('');

    const filteredStudents = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        if (!normalizedQuery) {
            return students;
        }

        return students.filter((student) => {
            return [
                student.name,
                student.matric_number,
                student.identification_number,
                student.gender,
                String(student.queue_number),
            ].some((value) => value.toLowerCase().includes(normalizedQuery));
        });
    }, [query, students]);

    const latestSubmission = useMemo(() => {
        if (!students.length) {
            return null;
        }

        return students.reduce((latest, student) => {
            return new Date(student.submitted_at) > new Date(latest.submitted_at) ? student : latest;
        }, students[0]);
    }, [students]);

    const statusClassName = statusStyles[session.status] || statusStyles.draft;

    return (
        <>
            <Head title={`Registered Students - ${session.name}`} />

            <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-gray-950 dark:text-gray-100">
                <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90">
                    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-600/20">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h1 className="truncate text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">
                                            Registered Students
                                        </h1>
                                        <p className="mt-0.5 truncate text-sm text-slate-600 dark:text-gray-400">
                                            {session.name}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium capitalize ring-1 ring-inset ${statusClassName}`}>
                                    {session.status}
                                </span>
                                <button
                                    type="button"
                                    onClick={toggleTheme}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                                    aria-label="Toggle dark mode"
                                >
                                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <section className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-gray-400">Total Registered</p>
                                    <p className="text-2xl font-semibold text-slate-950 dark:text-white">{totalStudents}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-gray-400">Latest Submission</p>
                                    <p className="text-sm font-semibold text-slate-950 dark:text-white">
                                        {latestSubmission ? new Date(latestSubmission.submitted_at).toLocaleString() : 'No submissions'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-gray-400">Privacy</p>
                                    <p className="text-sm font-semibold text-slate-950 dark:text-white">Protected records</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Student List</h2>
                                <p className="text-sm text-slate-600 dark:text-gray-400">
                                    {filteredStudents.length} of {totalStudents} shown
                                </p>
                            </div>

                            <label className="relative block w-full sm:max-w-xs">
                                <span className="sr-only">Search students</span>
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-gray-500" />
                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Search name, IC, matric"
                                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:bg-gray-950 dark:focus:ring-blue-400/20"
                                />
                            </label>
                        </div>

                        {filteredStudents.length > 0 ? (
                            <>
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="min-w-full divide-y divide-slate-200 dark:divide-gray-800">
                                        <thead className="bg-slate-50 dark:bg-gray-950/70">
                                            <tr>
                                                {['Queue', 'Student', 'Matric', 'IC Number', 'Gender', 'Registered At'].map((heading) => (
                                                    <th key={heading} className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-gray-400">
                                                        {heading}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                                            {filteredStudents.map((student) => (
                                                <tr key={student.queue_number} className="transition hover:bg-slate-50 dark:hover:bg-gray-800/70">
                                                    <td className="px-5 py-4">
                                                        <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-blue-100 px-2 text-sm font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                                                            {student.queue_number}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <p className="font-medium text-slate-950 dark:text-white">{student.name}</p>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <code className="rounded-md bg-slate-100 px-2 py-1 font-mono text-sm text-slate-700 dark:bg-gray-800 dark:text-gray-200">
                                                            {student.matric_number}
                                                        </code>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <code className="rounded-md bg-slate-100 px-2 py-1 font-mono text-sm text-slate-700 dark:bg-gray-800 dark:text-gray-200">
                                                            {student.identification_number}
                                                        </code>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <GenderBadge gender={student.gender} />
                                                    </td>
                                                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-gray-400">
                                                        {new Date(student.submitted_at).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="divide-y divide-slate-200 dark:divide-gray-800 md:hidden">
                                    {filteredStudents.map((student) => (
                                        <article key={student.queue_number} className="p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-950 dark:text-white">{student.name}</p>
                                                    <p className="mt-1 text-sm text-slate-600 dark:text-gray-400">
                                                        Queue #{student.queue_number}
                                                    </p>
                                                </div>
                                                <GenderBadge gender={student.gender} />
                                            </div>
                                            <div className="mt-4 grid gap-3 text-sm">
                                                <InfoRow icon={<IdCard className="h-4 w-4" />} label="Matric" value={student.matric_number} />
                                                <InfoRow icon={<Shield className="h-4 w-4" />} label="IC" value={student.identification_number} />
                                                <InfoRow icon={<Calendar className="h-4 w-4" />} label="Registered" value={new Date(student.submitted_at).toLocaleString()} />
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="px-4 py-14 text-center">
                                <Users className="mx-auto h-12 w-12 text-slate-300 dark:text-gray-700" />
                                <p className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">No students found</p>
                                <p className="mt-1 text-sm text-slate-600 dark:text-gray-400">
                                    {students.length ? 'Try a different search term.' : 'Submitted registrations will appear here.'}
                                </p>
                            </div>
                        )}
                    </section>

                    <footer className="py-6 text-center text-sm text-slate-500 dark:text-gray-500">
                        MyTrek Registration System
                    </footer>
                </main>
            </div>
        </>
    );
}

function GenderBadge({ gender }: { gender: string }) {
    const isMale = gender === 'male';

    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${
                isMale
                    ? 'bg-blue-100 text-blue-700 ring-blue-200 dark:bg-blue-950/70 dark:text-blue-200 dark:ring-blue-800'
                    : 'bg-pink-100 text-pink-700 ring-pink-200 dark:bg-pink-950/70 dark:text-pink-200 dark:ring-pink-800'
            }`}
        >
            {isMale ? 'Male' : 'Female'}
        </span>
    );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-slate-700 dark:bg-gray-950 dark:text-gray-300">
            <span className="flex items-center gap-2 text-slate-500 dark:text-gray-500">
                {icon}
                {label}
            </span>
            <span className="min-w-0 truncate font-medium text-slate-900 dark:text-white">{value}</span>
        </div>
    );
}
