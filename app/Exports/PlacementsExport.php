<?php

namespace App\Exports;

use App\Models\Placement;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class PlacementsExport implements FromCollection, WithHeadings, WithMapping
{
    protected string $registrationSessionId;

    protected ?int $classId;

    public function __construct(string $registrationSessionId, ?int $classId = null)
    {
        $this->registrationSessionId = $registrationSessionId;
        $this->classId = $classId;
    }

    public function collection()
    {
        $query = Placement::where('is_active', true)
            ->whereHas('student', function ($q) {
                $q->where('registration_session_id', $this->registrationSessionId)
                    ->where('is_submitted', true);
            })
            ->with([
                'student',
                'assignedClass.registrationSessionTrack.track',
            ]);

        if ($this->classId) {
            $query->where('assigned_class_id', $this->classId);
        }

        return $query->get()->sortBy('student.name');
    }

    public function headings(): array
    {
        return [
            'No.',
            'Matric Number',
            'Name',
            'Gender',
            'Race',
            'Class',
            'Track',
            'Priority',
            'Status',
            'Notes',
        ];
    }

    /**
     * @param  Placement  $placement
     */
    public function map($placement): array
    {
        static $index = 0;
        $index++;

        $priorityLabels = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];

        return [
            $index,
            $placement->student->matric_number,
            $placement->student->name,
            $placement->student->gender,
            $placement->student->race,
            $placement->assignedClass?->name ?? '',
            $placement->assignedClass?->registrationSessionTrack?->track?->name ?? '',
            $placement->track_priority ? ($priorityLabels[$placement->track_priority] ?? $placement->track_priority.'th').' Choice' : '',
            ucfirst(str_replace('_', ' ', $placement->placement_status)),
            $placement->placement_notes ?? '',
        ];
    }
}
