import { Link, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { 
    Home, 
    GraduationCap, 
    Users,
    Settings,
    UserCheck,
    User,
    LogOut,
    ChevronUp,
    Sun,
    Moon,
    X
} from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';

interface User {
    id: number;
    name: string;
    email: string;
}

interface SidebarProps {
    className?: string;
    user?: User;
    onClose?: () => void;
    isCollapsed?: boolean;
}

const navigation = [
    { 
        name: 'Dashboard', 
        href: '/', 
        icon: Home 
    },
    { 
        name: 'Semester Registration', 
        href: '/semester-registration', 
        icon: GraduationCap 
    },
];

const adminNavigation = [
    { 
        name: 'Users', 
        href: '/admin/users', 
        icon: Users 
    },
    { 
        name: 'Tracks', 
        href: '/admin/tracks', 
        icon: Settings 
    },
    { 
        name: 'Roles', 
        href: '/admin/roles', 
        icon: UserCheck 
    },
];

export default function Sidebar({ className = '', user, onClose, isCollapsed = false }: SidebarProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { theme, toggleTheme } = useTheme();

    const handleLogout = () => {
        router.post('/logout');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Generate avatar initials
    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className={`flex h-full ${isCollapsed ? 'w-16' : 'w-64'} flex-col bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ${className}`}>
            {/* Logo/Brand */}
            <div className={`flex h-16 shrink-0 items-center justify-between border-b border-gray-200 dark:border-gray-700 ${isCollapsed ? 'px-3' : 'px-6'}`}>
                {!isCollapsed && (
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                        Trek Poli
                    </h1>
                )}
                
                {isCollapsed && (
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">TP</span>
                    </div>
                )}
                
                {/* Mobile close button */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className={`flex-1 space-y-1 py-6 ${isCollapsed ? 'px-2' : 'px-4'}`}>
                {/* Main Navigation */}
                <div className="space-y-1">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={onClose}
                            className={`group flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 ${
                                isCollapsed ? 'px-2 py-2 justify-center' : 'px-3 py-2'
                            }`}
                            title={isCollapsed ? item.name : undefined}
                        >
                            <item.icon
                                className={`h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 ${
                                    isCollapsed ? '' : 'mr-3'
                                }`}
                                aria-hidden="true"
                            />
                            {!isCollapsed && item.name}
                        </Link>
                    ))}
                </div>

                {/* Administrator Section */}
                <div className="pt-6">
                    {!isCollapsed && (
                        <div className="px-3 py-2">
                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Administrator
                            </h3>
                        </div>
                    )}
                    {isCollapsed && (
                        <div className="px-2 py-2">
                            <div className="w-full h-px bg-gray-200 dark:bg-gray-700"></div>
                        </div>
                    )}
                    <div className="space-y-1">
                        {adminNavigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={onClose}
                                className={`group flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 ${
                                    isCollapsed ? 'px-2 py-2 justify-center' : 'px-3 py-2'
                                }`}
                                title={isCollapsed ? item.name : undefined}
                            >
                                <item.icon
                                    className={`h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 ${
                                        isCollapsed ? '' : 'mr-3'
                                    }`}
                                    aria-hidden="true"
                                />
                                {!isCollapsed && item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Profile Section at Bottom */}
            {user && (
                <div className={`border-t border-gray-200 dark:border-gray-700 ${isCollapsed ? 'p-2' : 'p-4'}`} ref={dropdownRef}>
                    <div className="relative">
                        {/* Profile Button */}
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={`w-full flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                                isCollapsed ? 'px-2 py-3 justify-center' : 'px-3 py-3'
                            }`}
                            title={isCollapsed ? user.name : undefined}
                        >
                            {/* Avatar */}
                            <div className={`flex items-center justify-center w-8 h-8 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-full text-sm font-semibold ${
                                isCollapsed ? '' : 'mr-3'
                            }`}>
                                {getInitials(user.name)}
                            </div>
                            
                            {/* User Info - Hidden when collapsed */}
                            {!isCollapsed && (
                                <>
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {user.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                    
                                    {/* Chevron */}
                                    <ChevronUp 
                                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                                            isDropdownOpen ? 'rotate-180' : ''
                                        }`}
                                    />
                                </>
                            )}
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && !isCollapsed && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                                <Link
                                    href="/profile"
                                    className="group flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        onClose?.();
                                    }}
                                >
                                    <User className="mr-3 h-4 w-4" />
                                    View Profile
                                </Link>
                                
                                <button
                                    onClick={toggleTheme}
                                    className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                                >
                                    {theme === 'light' ? (
                                        <Moon className="mr-3 h-4 w-4" />
                                    ) : (
                                        <Sun className="mr-3 h-4 w-4" />
                                    )}
                                    {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                                </button>
                                
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsDropdownOpen(false);
                                        onClose?.();
                                    }}
                                    className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                                >
                                    <LogOut className="mr-3 h-4 w-4" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}