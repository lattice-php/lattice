<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use Spatie\TypeScriptTransformer\Formatters\Formatter;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

/**
 * Formats generated TypeScript with the host app's oxfmt binary when available,
 * falling back to the package checkout for local development. Missing binaries
 * are treated as a no-op so generation still produces valid TypeScript.
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

        $binary = $this->resolveBinary();

        if ($binary === null) {
            return;
        }

        $process = new Process([$binary, '--write', ...$files]);
        $process->run();

        if (! $process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }
    }

    private function resolveBinary(): ?string
    {
        foreach (array_unique([
            base_path('node_modules/.bin/oxfmt'),
            dirname(__DIR__, 3).'/node_modules/.bin/oxfmt',
        ]) as $binary) {
            if (is_file($binary)) {
                return $binary;
            }
        }

        return null;
    }
}
