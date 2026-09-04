<?php
declare(strict_types=1);

namespace Lattice\Support\TypeScript;

use Illuminate\Support\Facades\File;
use Lattice\Core\Wire\WireModelBuilder;
use Lattice\Core\Wire\WireSourceCatalog;

/**
 * Default profile: builds the app's effective wire model in memory and
 * writes a module augmentation for every `origin: "app"` wire type, extending
 * the package's published types.
 */
final readonly class AugmentProfile implements TypeScriptProfile
{
    public function __construct(private WireSourceCatalog $catalog) {}

    public function run(): string
    {
        $appDirs = $this->appDirs();

        $document = new WireModelBuilder()->build(
            $this->catalog->builtinDirs(),
            $appDirs,
        );

        $appDefs = array_filter(
            $document['$defs'],
            static fn (array $def): bool => ($def['x-lattice']['origin'] ?? null) === 'app'
                && ($def['x-lattice']['kind'] ?? null) === 'props',
        );

        if ($appDefs === []) {
            throw new EmptyDiscoveryException(sprintf(
                'No app components were discovered for TypeScript generation. Declare `extra.lattice.discover` '
                .'in composer.json (or set `lattice.discover` in config/lattice.php) to point at your app source. '
                .'Paths checked: %s',
                $appDirs === [] ? '(none)' : implode(', ', $appDirs),
            ));
        }

        $output = (string) config('lattice.typescript.output');
        $module = (string) config('lattice.typescript.module', '@lattice-php/core');

        File::ensureDirectoryExists(dirname($output));
        File::put($output, new SchemaTypeScriptEmitter()->emitAugmentation($document, $module));

        new OxfmtFormatter()->format([$output]);

        return sprintf('Generated %d type(s) → %s', count($appDefs), $output);
    }

    /**
     * `WireSourceCatalog::appDirs()` only sees the root package's composer
     * `extra.lattice.discover`; fall back to `config('lattice.discover')`
     * (the same paths PHP-side discovery already unions in) so an app that
     * hasn't declared the composer key yet still generates.
     *
     * @return list<string>
     */
    private function appDirs(): array
    {
        $dirs = $this->catalog->appDirs();

        if ($dirs !== []) {
            return $dirs;
        }

        $configured = config('lattice.discover', []);

        return is_array($configured)
            ? array_values(array_filter($configured, is_string(...)))
            : [];
    }
}
