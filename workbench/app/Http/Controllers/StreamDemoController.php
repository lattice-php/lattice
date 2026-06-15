<?php

declare(strict_types=1);

namespace Workbench\App\Http\Controllers;

use Symfony\Component\HttpFoundation\StreamedResponse;

final class StreamDemoController
{
    public function __invoke(): StreamedResponse
    {
        return response()->stream(function (): void {
            foreach ($this->words() as $word) {
                echo $word;

                if (ob_get_level() > 0) {
                    ob_flush();
                }

                flush();
            }
        }, 200, [
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    /**
     * @return \Generator<int, string>
     */
    private function words(): \Generator
    {
        $sentence = 'This text is streamed one word at a time straight from a custom workbench endpoint using core Laravel response streaming.';

        foreach (explode(' ', $sentence) as $word) {
            yield $word.' ';
        }
    }
}
