<?php

namespace App\Exports;

use App\Models\Student;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class StudentsExport implements FromCollection, WithHeadings, WithMapping
{
    protected $registrationSessionId;

    public function __construct($registrationSessionId)
    {
        $this->registrationSessionId = $registrationSessionId;
    }

    public function collection()
    {
        return Student::where('registration_session_id', $this->registrationSessionId)->get();
    }

    public function headings(): array
    {
        return [
            'Matric Number',
            'Identification Number',
            'Name',
            'Gender',
            'Race',
            'Religion',
            'Email',
            'Phone',
            'Status',
            'Submitted At',
            'Created At',
        ];
    }

    public function map($student): array
    {
        return [
            $student->matric_number,
            $student->identification_number,
            $student->name,
            $student->gender,
            $student->race,
            $student->religion,
            $student->email,
            $student->phone,
            $student->is_submitted ? 'Submitted' : 'Draft',
            $student->submitted_at ? $student->submitted_at->format('Y-m-d H:i:s') : '',
            $student->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
