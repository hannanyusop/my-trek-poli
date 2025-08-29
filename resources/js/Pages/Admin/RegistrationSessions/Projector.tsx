import { Head } from '@inertiajs/react';
import { Calendar, Users, BookOpen, QrCode, Target, TrendingUp, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';

interface RegistrationSession {
    id: number;
    name: string;
    status: string;
    start_date: string;
    end_date: string;
    description: string;
    link_token: string;
}

interface Class {
    id: number;
    name: string;
    quota: number;
    current_count: number;
    is_active: boolean;
}

interface Props {
    session: RegistrationSession;
    classes: Class[];
    totalStudents: number;
    submittedStudents: number;
    registrationLink: string;
}

export default function Projector({ session, classes, totalStudents, submittedStudents, registrationLink }: Props) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [blinkClass, setBlinkClass] = useState('');

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Blink effect for live indicator
    useEffect(() => {
        const blinkTimer = setInterval(() => {
            setBlinkClass(prev => prev === '' ? 'animate-pulse' : '');
        }, 1000);

        return () => clearInterval(blinkTimer);
    }, []);

    // Auto-refresh page every 30 seconds to get live data
    useEffect(() => {
        const refreshTimer = setInterval(() => {
            window.location.reload();
        }, 30000); // 30 seconds

        return () => clearInterval(refreshTimer);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-green-500';
            case 'pending':
                return 'bg-yellow-500';
            case 'closed':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const pendingStudents = totalStudents - submittedStudents;
    const completionRate = totalStudents > 0 ? (submittedStudents / totalStudents) * 100 : 0;

    return (
        <>
            <Head title={`Live Registration - ${session.name}`} />
            
            {/* Full Screen Container */}
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white p-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center mb-4">
                        <div className={`w-3 h-3 rounded-full mr-3 ${getStatusColor(session.status)} ${blinkClass}`}></div>
                        <h1 className="text-5xl font-bold">{session.name}</h1>
                        <div className={`w-3 h-3 rounded-full ml-3 ${getStatusColor(session.status)} ${blinkClass}`}></div>
                    </div>
                    <p className="text-xl text-blue-200 mb-2">{session.description}</p>
                    <div className="flex items-center justify-center text-lg text-blue-300">
                        <Clock className="mr-2 h-5 w-5" />
                        Live as of {currentTime.toLocaleTimeString()}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Left Column - Live Stats */}
                    <div className="lg:col-span-2">
                        {/* Student Registration Stats */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20">
                            <h2 className="text-3xl font-bold mb-6 flex items-center">
                                <TrendingUp className="mr-3 h-8 w-8 text-green-400" />
                                Live Registration Status
                            </h2>
                            
                            <div className="grid grid-cols-3 gap-6 mb-6">
                                <div className="text-center">
                                    <div className="text-5xl font-bold text-blue-300 mb-2">{totalStudents}</div>
                                    <div className="text-lg text-blue-200">Total Registered</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-5xl font-bold text-green-400 mb-2">{submittedStudents}</div>
                                    <div className="text-lg text-green-300">Submitted</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-5xl font-bold text-yellow-400 mb-2">{pendingStudents}</div>
                                    <div className="text-lg text-yellow-300">Pending</div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-white/20 rounded-full h-4 mb-4">
                                <div 
                                    className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${completionRate}%` }}
                                ></div>
                            </div>
                            <div className="text-center text-lg">
                                {completionRate.toFixed(1)}% Completion Rate
                            </div>
                        </div>

                        {/* Classes Overview */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                            <h2 className="text-3xl font-bold mb-6 flex items-center">
                                <BookOpen className="mr-3 h-8 w-8 text-purple-400" />
                                Class Availability
                            </h2>
                            
                            {classes.length > 0 ? (
                                <div className="space-y-4">
                                    {classes.map((classItem) => {
                                        const availableSlots = classItem.quota - classItem.current_count;
                                        const fillPercentage = (classItem.current_count / classItem.quota) * 100;
                                        const isFullyBooked = availableSlots <= 0;
                                        
                                        return (
                                            <div key={classItem.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-2xl font-semibold">{classItem.name}</h3>
                                                    <div className="flex items-center">
                                                        <Users className="mr-2 h-6 w-6 text-blue-300" />
                                                        <span className="text-2xl font-bold">
                                                            {classItem.current_count} / {classItem.quota}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {/* Progress bar for class capacity */}
                                                <div className="w-full bg-white/20 rounded-full h-3 mb-3">
                                                    <div 
                                                        className={`h-3 rounded-full transition-all duration-500 ${
                                                            isFullyBooked 
                                                                ? 'bg-red-500' 
                                                                : fillPercentage > 80 
                                                                    ? 'bg-yellow-500' 
                                                                    : 'bg-green-500'
                                                        }`}
                                                        style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                                                    ></div>
                                                </div>
                                                
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center">
                                                        <Target className="mr-2 h-5 w-5 text-gray-300" />
                                                        <span className="text-lg">
                                                            {availableSlots} slots available
                                                        </span>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                        isFullyBooked 
                                                            ? 'bg-red-500/20 text-red-300 border border-red-400' 
                                                            : availableSlots <= 5 
                                                                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400' 
                                                                : 'bg-green-500/20 text-green-300 border border-green-400'
                                                    }`}>
                                                        {isFullyBooked ? 'FULL' : availableSlots <= 5 ? 'ALMOST FULL' : 'AVAILABLE'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-300">
                                    <BookOpen className="mx-auto h-16 w-16 mb-4 opacity-50" />
                                    <p className="text-xl">No classes available for this session.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - QR Code */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center h-fit sticky top-8">
                            <h2 className="text-3xl font-bold mb-6 flex items-center justify-center">
                                <QrCode className="mr-3 h-8 w-8 text-cyan-400" />
                                Register Now
                            </h2>
                            
                            <div className="bg-white p-6 rounded-xl mb-6 inline-block">
                                <QRCodeSVG 
                                    value={registrationLink}
                                    size={280}
                                    level="M"
                                    includeMargin={true}
                                />
                            </div>
                            
                            <div className="space-y-4">
                                <div className="text-lg text-cyan-200">
                                    Scan QR code to register
                                </div>
                                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                    <code className="text-sm text-cyan-300 break-all">
                                        {registrationLink}
                                    </code>
                                </div>
                                
                                {/* Session Duration */}
                                <div className="text-center pt-6">
                                    <div className="text-sm text-gray-300 mb-2">Registration Period</div>
                                    <div className="flex items-center justify-center text-lg text-blue-200">
                                        <Calendar className="mr-2 h-5 w-5" />
                                        {new Date(session.start_date).toLocaleDateString()} - {new Date(session.end_date).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-blue-300">
                    <p className="text-lg">
                        🔴 LIVE • Auto-refreshing every 30 seconds • {currentTime.toLocaleString()}
                    </p>
                </div>
            </div>
        </>
    );
}