export interface RegistrationSession {
    id: number;
    name: string;
    status: string;
    start_date: string;
    end_date: string;
    description: string;
    link_token: string;
}

export interface Student {
    id: number;
    matric_number: string;
    identification_number?: string;
    name: string;
    gender?: 'male' | 'female';
    race?: string;
    religion?: string;
    email: string;
    phone?: string;
    is_submitted?: boolean;
    submitted_at?: string | null;
}

export interface Track {
    id: number;
    registration_session_id: number;
    track_id: number;
    name: string;
    description: string;
    track: {
        id: number;
        name: string;
        description: string;
    };
}

export interface Race {
    id: number;
    name: string;
    code: string;
    is_active: boolean;
}

export interface Religion {
    id: number;
    name: string;
    code: string;
    is_active: boolean;
}

export interface BaseTrack {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
}

export interface RegistrationSessionTrack {
    id: number;
    registration_session_id: number;
    track_id: number;
    name: string;
    description: string;
    track: BaseTrack;
}

export interface Class {
    id: number;
    name: string;
    quota: number;
    current_count: number;
    is_active: boolean;
    registration_session_track: RegistrationSessionTrack;
}

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface DashboardStats {
    total_users: number;
    total_students: number;
    total_tracks: number;
    active_sessions: number;
    total_registrations: number;
}

export interface StudentWithRelations extends Student {
    race?: Race;
    religion?: Religion;
}

export interface RegistrationSessionWithTracks extends RegistrationSession {
    tracks: RegistrationSessionTrack[];
}

export interface FlashMessages {
    success?: string;
    error?: string;
}

export interface PageProps {
    flash?: FlashMessages;
    [key: string]: any;
}