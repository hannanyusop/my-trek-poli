<?php

namespace App\Jobs;

use App\Enums\RegistrationSessionStatus;
use App\Models\RegistrationSession;
use App\Services\PlacementService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ProcessPlacementJob implements ShouldQueue
{
    use Queueable;

    public int $timeout = 600; // 10 minutes timeout

    public int $tries = 1;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $sessionId
    ) {}

    /**
     * Execute the job.
     */
    public function handle(PlacementService $placementService): void
    {
        try {
            Log::info('Starting placement processing', ['session_id' => $this->sessionId]);

            $result = $placementService->processSession($this->sessionId);

            if ($result['success']) {
                // Update session status to placement
                $session = RegistrationSession::findOrFail($this->sessionId);
                $session->update(['status' => RegistrationSessionStatus::Placement]);

                Log::info('Placement completed successfully', [
                    'session_id' => $this->sessionId,
                    'result' => $result,
                ]);
            } else {
                // Update session status back to closed on failure
                $session = RegistrationSession::findOrFail($this->sessionId);
                $session->update(['status' => RegistrationSessionStatus::Closed]);

                Log::error('Placement failed', [
                    'session_id' => $this->sessionId,
                    'result' => $result,
                ]);
            }
        } catch (\Exception $e) {
            // Update session status back to closed on exception
            $session = RegistrationSession::findOrFail($this->sessionId);
            $session->update(['status' => RegistrationSessionStatus::Closed]);

            Log::error('Placement job exception', [
                'session_id' => $this->sessionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }
}
