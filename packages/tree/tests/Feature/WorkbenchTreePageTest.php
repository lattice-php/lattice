<?php
declare(strict_types=1);

use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

it('serves the workbench tree demo page', function (): void {
    withoutVite();

    $response = get('/tree');

    $response->assertSuccessful();
    $response->assertInertia(
        fn (Assert $page): Assert => $page
            ->component('lattice/page', shouldExist: false)
            ->where('lattice', fn (mixed $lattice): bool => str_contains(json_encode($lattice, JSON_THROW_ON_ERROR), '"type":"tree"')),
    );
});

it('serves the plain page the demo tree links to', function (): void {
    withoutVite();

    get('/plain')->assertSuccessful();
});

it('serves the lazy tree demo page with interactive props', function (): void {
    withoutVite();

    $response = get('/tree-lazy');

    $response->assertSuccessful();
    $response->assertInertia(
        fn (Assert $page): Assert => $page
            ->component('lattice/page', shouldExist: false)
            ->where('lattice', function (mixed $lattice): bool {
                $wire = json_encode($lattice, JSON_THROW_ON_ERROR);

                return str_contains($wire, '"lazy":true')
                    && str_contains($wire, '\/lattice\/trees\/categories');
            }),
    );
});
