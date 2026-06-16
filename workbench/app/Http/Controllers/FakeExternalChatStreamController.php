<?php
declare(strict_types=1);

namespace Workbench\App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

final readonly class FakeExternalChatStreamController
{
    public function __invoke(Request $request): StreamedResponse
    {
        abort_unless($request->bearerToken() === 'fake-workbench-crm-token', 403);

        return response()->stream(function (): void {
            $this->writeFrame(['type' => 'text', 'value' => 'External CRM stream response.']);
            $this->writeFrame(['type' => 'done']);
        }, 200, [
            'Cache-Control' => 'no-cache',
            'Content-Type' => 'application/x-ndjson',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    /**
     * @param  array<string, mixed>  $frame
     */
    private function writeFrame(array $frame): void
    {
        echo json_encode($frame, JSON_THROW_ON_ERROR)."\n";

        if (ob_get_level() > 0) {
            ob_flush();
        }

        flush();
    }
}
