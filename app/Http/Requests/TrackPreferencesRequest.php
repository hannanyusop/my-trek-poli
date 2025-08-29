<?php

namespace App\Http\Requests;

use App\Models\RegistrationSession;
use App\Models\RegistrationSessionTrack;
use Illuminate\Foundation\Http\FormRequest;

class TrackPreferencesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $registrationSession = RegistrationSession::where('link_token', $this->route('token'))->first();
        $totalTracksCount = RegistrationSessionTrack::where('registration_session_id', $registrationSession->id)->count();

        return [
            'preferences' => [
                'required',
                'array',
                "size:{$totalTracksCount}",
            ],
            'preferences.*' => 'required|integer|exists:registration_session_tracks,id',
        ];
    }

    public function messages(): array
    {
        $registrationSession = RegistrationSession::where('link_token', $this->route('token'))->first();
        $totalTracksCount = RegistrationSessionTrack::where('registration_session_id', $registrationSession->id)->count();

        return [
            'preferences.required' => 'You must select all track preferences',
            'preferences.array' => 'Track preferences must be an array',
            'preferences.size' => "You must select all {$totalTracksCount} available tracks",
            'preferences.*.required' => 'Each track preference is required',
            'preferences.*.integer' => 'Each track preference must be a valid track ID',
            'preferences.*.exists' => 'Selected track does not exist',
        ];
    }
}
