<?php

declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

use Illuminate\Console\Command;
use Lattice\Lattice\Support\TypeScript\AugmentationWriter;
use Lattice\Lattice\Support\TypeScript\ComponentDiscovery;
use Lattice\Lattice\Support\TypeScript\DiscoveredComponent;

final class TypeScriptCommand extends Command
{
    protected $signature = 'lattice:typescript';

    protected $description = "Generate TypeScript types for the app's custom Lattice components";

    public function handle(ComponentDiscovery $discovery, AugmentationWriter $writer): int
    {
        $discovered = $this->discoverAll($discovery);

        $output = config('lattice.typescript.output');
        $module = config('lattice.typescript.module', '@lattice-php/lattice');

        $writer->write($discovered, $output, $module);

        $this->components->info(sprintf('Generated %d type(s) → %s', count($discovered), $output));

        return self::SUCCESS;
    }

    /**
     * @return list<DiscoveredComponent>
     */
    private function discoverAll(ComponentDiscovery $discovery): array
    {
        $discoveryPaths = config('lattice.discover', []);

        if (! is_array($discoveryPaths)) {
            return [];
        }

        $discovered = [];

        foreach ($discoveryPaths as $path => $namespace) {
            // Support both "path => namespace" and ["path" => ..., "namespace" => ...] config forms.
            if (is_array($namespace)) {
                $path = $namespace['path'] ?? null;
            }

            if (is_string($path)) {
                $discovered = [...$discovered, ...$discovery->discover($path)];
            }
        }

        return $discovered;
    }
}
