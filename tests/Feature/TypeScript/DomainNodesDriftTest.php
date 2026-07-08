<?php

declare(strict_types=1);

use Lattice\Lattice\Support\TypeScript\ComponentDiscovery;
use Workbench\App\Support\TypeScript\BaseProfile;

/**
 * Guards the hand-maintained BaseProfile::DOMAIN_NODES list against drift: every
 * #[AsComponent] domain under src/ must be registered there (or handled out of
 * band — form fields under 'Forms', columns via ColumnPropsMap). A domain that is
 * neither would be silently dropped from the generated ComponentPropsMap/NodeType,
 * so its components would render with untyped props and never fail a build.
 */
test('every src component domain is registered for node generation', function (): void {
    $components = (new ComponentDiscovery)->discover(dirname(__DIR__, 3).'/src');

    $handledOutOfBand = ['Forms'];
    $registered = [...BaseProfile::domainNodeNames(), ...$handledOutOfBand];

    $unregistered = collect($components)
        ->reject(fn ($component): bool => in_array($component->category, ['column', 'filter'], true))
        ->map(fn ($component): string => $component->domain)
        ->unique()
        ->reject(fn (string $domain): bool => in_array($domain, $registered, true))
        ->values()
        ->all();

    expect($unregistered)->toBe([]);
});
