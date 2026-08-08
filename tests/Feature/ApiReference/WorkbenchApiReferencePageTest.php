<?php
declare(strict_types=1);

use Lattice\ApiReference\ApiReference;
use Lattice\Ui\PageSchema;
use Workbench\App\Pages\ApiReferencePage;

it('rewrites the fixture servers to the workbench origin', function (): void {
    $schema = app(ApiReferencePage::class)->render(PageSchema::make());
    $reference = $schema->renderable()[0];

    expect($reference)->toBeInstanceOf(ApiReference::class)
        ->and($reference->jsonSerialize()['props']['spec']['servers'])->toBe([
            ['url' => '/api'],
        ]);
});
