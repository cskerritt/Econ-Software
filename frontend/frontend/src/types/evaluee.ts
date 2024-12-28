export interface Evaluee {
    id: number;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface EvalueeFormData {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    notes?: string;
}
