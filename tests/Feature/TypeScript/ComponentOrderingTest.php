<?php

declare(strict_types=1);

use Lattice\Lattice\Support\TypeScript\ComponentDiscovery;
use Workbench\App\Providers\TypeScriptTransformerServiceProvider;

it('covers every discovered built-in component type in exactly one ORDER list', function () {
    $packageRoot = dirname(__DIR__, 3);

    $discovered = (new ComponentDiscovery)->discover($packageRoot.'/src', 'Lattice\\Lattice');

    $discoveredTypes = array_map(fn ($dc) => $dc->type, $discovered);
    $knownTypes = TypeScriptTransformerServiceProvider::knownOrderedTypes();

    $missing = array_values(array_diff($discoveredTypes, $knownTypes));
    $stale = array_values(array_diff($knownTypes, $discoveredTypes));

    expect($missing)
        ->toBeEmpty(
            'The following discovered built-in component type(s) are missing from the provider\'s ORDER constants. '
            .'Add each type to the matching *_ORDER list and to knownOrderedTypes(): '
            .implode(', ', $missing),
        );

    expect($stale)
        ->toBeEmpty(
            'The following type(s) appear in the provider\'s ORDER constants but no longer have a matching #[Component] built-in. '
            .'Remove them from the matching *_ORDER list and from knownOrderedTypes(): '
            .implode(', ', $stale),
        );
});
