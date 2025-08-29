<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TrackPreferencesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'preferences' => 'required|array|min:1',
            'preferences.*' => 'required|integer|exists:registration_session_tracks,id',
        ];
    }

    public function messages(): array
    {
        return [
            'preferences.required' => 'You must select at least one track preference',
            'preferences.array' => 'Track preferences must be an array',
            'preferences.min' => 'You must select at least one track preference',
            'preferences.*.required' => 'Each track preference is required',
            'preferences.*.integer' => 'Each track preference must be a valid track ID',
            'preferences.*.exists' => 'Selected track does not exist',
        ];
    }
}
