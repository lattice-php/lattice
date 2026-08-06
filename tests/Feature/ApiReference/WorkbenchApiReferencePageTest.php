<?php
declare(strict_types=1);

use Inertia\Testing\AssertableInertia as Assert;
use Lattice\ApiReference\ApiReference;
use Lattice\Ui\PageSchema;
use Workbench\App\Pages\ApiReferencePage;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

it('serves the workbench API reference demo page', function (): void {
    actingAs(workbenchTestUser());
    withoutVite();

    $response = get('/api-reference');

    $response->assertSuccessful();
    $response->assertInertia(
        fn (Assert $page): Assert => $page
            ->component('lattice/page', shouldExist: false)
            ->where('lattice', fn (mixed $lattice): bool => str_contains(json_encode($lattice, JSON_THROW_ON_ERROR), '"type":"api-reference"')),
    );
});

it('rewrites the fixture servers to the workbench origin', function (): void {
    $schema = app(ApiReferencePage::class)->render(PageSchema::make());
    $reference = $schema->renderable()[0];

    expect($reference)->toBeInstanceOf(ApiReference::class)
        ->and($reference->jsonSerialize()['props']['spec']['servers'])->toBe([
            ['url' => '/api'],
        ]);
});
