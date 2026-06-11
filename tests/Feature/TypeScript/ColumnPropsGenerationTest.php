<?php

declare(strict_types=1);

use Illuminate\Support\Facades\File;
use Lattice\Lattice\Support\TypeScript\PropsTypeGenerator;
use Lattice\Lattice\Tests\Fixtures\TypeScript\SampleColumn;

use function Pest\Laravel\artisan;

it('generates a TS type for own public properties only, excluding inherited ones', function () {
    $generator = new PropsTypeGenerator;

    $type = $generator->forClass(SampleColumn::class, true);

    expect($type)->toContain('max')->toContain('number');
    expect(str_contains($type, 'key'))->toBeFalse();
});

it('writes a ColumnProps augmentation for column-category components', function () {
    $output = base_path('resources/js/lattice/generated-column.d.ts');

    config()->set('lattice.typescript.output', $output);
    config()->set('lattice.typescript.module', '@lattice-php/lattice');
    config()->set('lattice.discover', [
        dirname(__DIR__, 2).'/Fixtures/TypeScript' => 'Lattice\\Lattice\\Tests\\Fixtures\\TypeScript',
    ]);

    artisan('lattice:typescript')->assertSuccessful();

    $contents = file_get_contents($output);

    expect($contents)
        ->toBeString()
        ->toContain('declare module "@lattice-php/lattice"')
        ->toContain('interface ComponentProps')
        ->toContain('"sample.field"')
        ->toContain('"sample.widget"')
        ->toContain('interface ColumnProps')
        ->toContain('"column.rating"')
        ->toContain('max: number;');

    File::delete($output);
});
