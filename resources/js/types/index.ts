export interface RegistrationSession {
    id: number;
    name: string;
    description: string;
    link_token: string;
    start_date: string;
    end_date: string;
}

export interface Student {
    id: number;
    matric_number: string;
    identification_number?: string;
    name?: string;
    gender?: 'male' | 'female';
    race?: string;
    religion?: string;
    email?: string;
    phone?: string;
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