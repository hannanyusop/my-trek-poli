<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class StudentsImport implements ToCollection, WithHeadingRow
{
    protected array $previewData = [];
    protected array $validationErrors = [];

    /**
     * @param Collection $collection
     */
    public function collection(Collection $collection): void
    {
        $expectedHeaders = [
            'matric_number',
            'identification_number',
            'name', 
            'gender',
            'race',
            'religion',
            'email',
            'phone'
        ];

        foreach ($collection as $index => $row) {
            $rowNumber = $index + 2; // +2 because heading row is 1 and we start from 0
            $studentData = $row->toArray();
            
            // Validate required fields
            $errors = [];
            
            if (empty($studentData['matric_number'])) {
                $errors[] = 'Matric number is required';
            }
            
            if (empty($studentData['identification_number'])) {
                $errors[] = 'Identification number is required';
            }
            
            if (empty($studentData['name'])) {
                $errors[] = 'Name is required';
            }
            
            if (!empty($studentData['gender']) && !in_array(strtolower($studentData['gender']), ['male', 'female'])) {
                $errors[] = 'Gender must be Male or Female';
            }
            
            if (!empty($studentData['email']) && !filter_var($studentData['email'], FILTER_VALIDATE_EMAIL)) {
                $errors[] = 'Invalid email format';
            }
            
            // Store preview data
            $this->previewData[] = [
                'row_number' => $rowNumber,
                'data' => $studentData,
                'has_errors' => !empty($errors)
            ];
            
            // Store validation errors
            if (!empty($errors)) {
                $this->validationErrors[$rowNumber] = $errors;
            }
        }
    }

    /**
     * Get preview data for display
     */
    public function getPreviewData(): array
    {
        return $this->previewData;
    }

    /**
     * Get validation errors
     */
    public function getValidationErrors(): array
    {
        return $this->validationErrors;
    }
}
