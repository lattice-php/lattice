<?php

declare(strict_types=1);

namespace Workbench\App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

final class ChatStreamController
{
    public function __invoke(Request $request): StreamedResponse
    {
        $message = trim((string) $request->input('message'));

        return response()->stream(function () use ($message): void {
            foreach ($this->reply($message) as $chunk) {
                echo $chunk;

                if (ob_get_level() > 0) {
                    ob_flush();
                }

                flush();

                if (! app()->runningUnitTests()) {
                    usleep(100000);
                }
            }
        }, 200, [
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    /**
     * Streams a fixed lorem-ipsum paragraph word by word. The user's message is
     * accepted so the demo mirrors a real chat round-trip, but the canned reply
     * stays deterministic to keep the feature and browser tests stable.
     *
     * @return \Generator<int, string>
     */
    private function reply(string $message): \Generator
    {
        $paragraph = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

        foreach (explode(' ', $paragraph) as $word) {
            yield $word.' ';
        }
    }
}
