<?php

namespace App\Exports;

use App\Models\Student;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class StudentTemplateExport implements FromCollection, WithHeadings
{
    protected array $headers;

    public function __construct(array $headers)
    {
        $this->headers = $headers;
    }

    public function collection()
    {
        // Return empty collection for template - just headers
        return collect([]);
    }

    public function headings(): array
    {
        return $this->headers;
    }
}
