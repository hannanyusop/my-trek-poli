import { Link, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { 
    Bell,
    User,
    LogOut,
    ChevronDown,
    Sun,
    Moon,
    Menu,
    PanelLeft,
    PanelLeftClose
} from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';

interface User {
    id: number;
    name: string;
    email: string;
}

interface TopBarProps {
    user?: User;
    onMenuClick?: () => void;
    onSidebarToggle?: () => void;
    isSidebarCollapsed?: boolean;
    title?: string;
}

export default function TopBar({ user, onMenuClick, onSidebarToggle, isSidebarCollapsed, title }: TopBarProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);
    const { theme, toggleTheme } = useTheme();

    const handleLogout = () => {
        router.post('/logout');
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false);
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
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 h-16">
            <div className="flex items-center justify-between h-full px-6">
                {/* Left side */}
                <div className="flex items-center space-x-4">
                    {/* Mobile menu button */}
                    {onMenuClick && (
                        <button
                            onClick={onMenuClick}
                            className="lg:hidden p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Open menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    )}

                    {/* Desktop sidebar toggle button */}
                    {onSidebarToggle && (
                        <button
                            onClick={onSidebarToggle}
                            className="hidden lg:flex p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {isSidebarCollapsed ? (
                                <PanelLeft className="h-5 w-5" />
                            ) : (
                                <PanelLeftClose className="h-5 w-5" />
                            )}
                        </button>
                    )}
                    
                    {/* Page title */}
                    {title && (
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {title}
                        </h1>
                    )}
                </div>

                {/* Right side */}
                <div className="flex items-center space-x-4">
                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                    >
                        {theme === 'light' ? (
                            <Moon className="h-5 w-5" />
                        ) : (
                            <Sun className="h-5 w-5" />
                        )}
                    </button>

                    {/* Notifications */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                            <Bell className="h-5 w-5" />
                            {/* Notification badge */}
                            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
                        </button>

                        {/* Notifications dropdown */}
                        {isNotificationOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                        Notifications
                                    </h3>
                                </div>
                                <div className="p-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                        No new notifications
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User profile */}
                    {user && (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                            >
                                {/* Avatar */}
                                <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-full text-sm font-semibold">
                                    {getInitials(user.name)}
                                </div>
                                
                                {/* User name (hidden on mobile) */}
                                <span className="hidden lg:block text-sm font-medium text-gray-900 dark:text-white">
                                    {user.name}
                                </span>
                                
                                <ChevronDown className="h-4 w-4" />
                            </button>

                            {/* User dropdown */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 lg:hidden">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {user.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                    
                                    <div className="py-2">
                                        <Link
                                            href="/profile"
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            <User className="mr-3 h-4 w-4" />
                                            View Profile
                                        </Link>
                                        
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsDropdownOpen(false);
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                                        >
                                            <LogOut className="mr-3 h-4 w-4" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}