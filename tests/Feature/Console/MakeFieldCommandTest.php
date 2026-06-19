<?php
declare(strict_types=1);

use Illuminate\Support\Facades\File;

use function Pest\Laravel\artisan;

function withFieldScaffold(Closure $callback): mixed
{
    return withScaffoldWorkspace(function () use ($callback): mixed {
        File::put(resource_path('js/registry.ts'), latticeRegistryStub());

        return $callback();
    });
}

it('scaffolds a field PHP class, a tsx renderer, registers it and derives the type', function (): void {
    withFieldScaffold(function (): void {
        artisan('lattice:field', ['name' => 'ColorPicker'])->assertSuccessful();

        $php = File::get(app_path('Forms/Fields/ColorPicker.php'));
        expect($php)
            ->toContain('namespace App\\Forms\\Fields;')
            ->toContain('use Lattice\\Lattice\\Forms\\Attributes\\AsField;')
            ->toContain("#[AsField(type: 'color-picker')]")
            ->toContain('class ColorPicker extends Field');

        $tsx = File::get(resource_path('js/fields/color-picker.tsx'));
        expect($tsx)->toContain('RendererComponent<"field.color-picker">');

        $plugin = File::get(resource_path('js/registry.ts'));
        expect($plugin)
            ->toContain('eagerComponent')
            ->toContain('import { ColorPickerComponent } from "./fields/color-picker";')
            ->toContain('"field.color-picker": eagerComponent(ColorPickerComponent)');
    });
});

it('is idempotent — re-running does not duplicate the registration', function (): void {
    withFieldScaffold(function (): void {
        artisan('lattice:field', ['name' => 'ColorPicker'])->assertSuccessful();
        artisan('lattice:field', ['name' => 'ColorPicker'])->assertSuccessful();

        $plugin = File::get(resource_path('js/registry.ts'));
        expect(substr_count($plugin, '"field.color-picker": eagerComponent'))->toBe(1)
            ->and(substr_count($plugin, 'import { ColorPickerComponent }'))->toBe(1);
    });
});

it('honors a --type override', function (): void {
    withFieldScaffold(function (): void {
        artisan('lattice:field', ['name' => 'Swatch', '--type' => 'color'])->assertSuccessful();

        expect(File::get(app_path('Forms/Fields/Swatch.php')))
            ->toContain("#[AsField(type: 'color')]");

        expect(File::get(resource_path('js/fields/swatch.tsx')))
            ->toContain('RendererComponent<"field.color">');

        expect(File::get(resource_path('js/registry.ts')))
            ->toContain('"field.color": eagerComponent(SwatchComponent)');
    });
});

it('registers multiple distinct fields without clobbering earlier ones', function (): void {
    withFieldScaffold(function (): void {
        artisan('lattice:field', ['name' => 'ColorPicker'])->assertSuccessful();
        artisan('lattice:field', ['name' => 'StarRating'])->assertSuccessful();

        $plugin = File::get(resource_path('js/registry.ts'));

        expect($plugin)
            ->toContain('"field.color-picker": eagerComponent(ColorPickerComponent)')
            ->toContain('"field.star-rating": eagerComponent(StarRatingComponent)')
            ->toContain('import { ColorPickerComponent } from "./fields/color-picker";')
            ->toContain('import { StarRatingComponent } from "./fields/star-rating";');
    });
});
