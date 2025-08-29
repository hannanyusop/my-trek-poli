<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StudentRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'identification_number' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'gender' => 'required|in:male,female',
            'race' => 'required|string|max:100',
            'religion' => 'required|string|max:100',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
        ];
    }

    public function messages(): array
    {
        return [
            'identification_number.required' => 'IC/Passport number is required',
            'name.required' => 'Name is required',
            'gender.required' => 'Gender is required',
            'gender.in' => 'Gender must be either male or female',
            'race.required' => 'Race is required',
            'religion.required' => 'Religion is required',
            'email.required' => 'Email is required',
            'email.email' => 'Email must be a valid email address',
            'phone.required' => 'Phone number is required',
        ];
    }
}
