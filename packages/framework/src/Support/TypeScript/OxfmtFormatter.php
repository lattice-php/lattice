<?php
declare(strict_types=1);

namespace Lattice\Support\TypeScript;

use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

/**
 * Formats generated TypeScript with the host app's oxfmt binary when available,
 * falling back to the package checkout for local development. A missing binary
 * is a no-op: the byte-exact snapshot test catches any formatting divergence,
 * and the PHP CI test jobs deliberately run without node_modules.
 *
 * Files are piped through stdin instead of formatted with --write: since oxfmt
 * 0.63 ignore rules (including the git root's .gitignore) apply to explicitly
 * passed paths, and generated files regularly live in gitignored directories —
 * the Testbench skeleton here, generated type folders in consumer apps.
 */
final readonly class OxfmtFormatter
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

        foreach ($files as $file) {
            $contents = file_get_contents($file);

            if ($contents === false) {
                continue;
            }

            $process = new Process([$binary, '--stdin-filepath='.$file]);
            $process->setInput($contents);
            $process->run();

            if (! $process->isSuccessful()) {
                throw new ProcessFailedException($process);
            }

            file_put_contents($file, $process->getOutput());
        }
    }

    private function resolveBinary(): ?string
    {
        foreach (array_unique([
            base_path('node_modules/.bin/oxfmt'),
            dirname(__DIR__, 3).'/node_modules/.bin/oxfmt',
            // In the monorepo, node_modules is hoisted to the workspace root
            // two levels above the package checkout.
            dirname(__DIR__, 5).'/node_modules/.bin/oxfmt',
        ]) as $binary) {
            if (is_file($binary)) {
                return $binary;
            }
        }

        return null;
    }
}
