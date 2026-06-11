<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use Spatie\TypeScriptTransformer\Formatters\Formatter;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

/**
 * Formats the generated TypeScript with the project's own oxfmt binary so the
 * output matches the same style as the hand-written sources. Falls back to a
 * no-op when the binary is absent (e.g. a node-less environment) so generation
 * still produces valid, if unformatted, TypeScript.
 */
final class OxfmtFormatter implements Formatter
{
    /**
     * @param  array<int, string>  $files
     */
    public function format(array $files): void
    {
        if ($files === []) {
            return;
        }

        $binary = dirname(__DIR__, 3).'/node_modules/.bin/oxfmt';

        if (! is_file($binary)) {
            return;
        }

        $process = new Process([$binary, '--write', ...$files]);
        $process->run();

        if (! $process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }
    }
}
