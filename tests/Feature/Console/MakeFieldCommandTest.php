<?php
declare(strict_types=1);

use Illuminate\Support\Facades\File;

use function Pest\Laravel\artisan;

function withFieldScaffold(Closure $callback): mixed
{
    return withScaffoldWorkspace(function () use ($callback): mixed {
        File::put(resource_path('js/lattice/plugin.ts'),
            "import { createPlugin } from \"@lattice-php/lattice\";\n\nexport const appPlugin = createPlugin({\n  name: \"app\",\n  components: {},\n});\n");

        return $callback();
    });
}

it('scaffolds a field PHP class, a tsx renderer, registers it and derives the type', function () {
    withFieldScaffold(function () {
        artisan('lattice:field', ['name' => 'ColorPicker'])->assertSuccessful();

        $php = File::get(app_path('Forms/Fields/ColorPicker.php'));
        expect($php)
            ->toContain('namespace App\\Forms\\Fields;')
            ->toContain('use Lattice\\Lattice\\Attributes\\Component;')
            ->toContain("#[Component('form.color-picker')]")
            ->toContain('class ColorPicker extends Field');

        $tsx = File::get(resource_path('js/lattice/fields/color-picker.tsx'));
        expect($tsx)->toContain('RendererComponent<"form.color-picker">');

        $plugin = File::get(resource_path('js/lattice/plugin.ts'));
        expect($plugin)
            ->toContain('eagerComponent')
            ->toContain('import { ColorPickerComponent } from "./fields/color-picker";')
            ->toContain('"form.color-picker": eagerComponent(ColorPickerComponent)');
    });
});

it('is idempotent — re-running does not duplicate the registration', function () {
    withFieldScaffold(function () {
        artisan('lattice:field', ['name' => 'ColorPicker'])->assertSuccessful();
        artisan('lattice:field', ['name' => 'ColorPicker'])->assertSuccessful();

        $plugin = File::get(resource_path('js/lattice/plugin.ts'));
        expect(substr_count($plugin, '"form.color-picker": eagerComponent'))->toBe(1)
            ->and(substr_count($plugin, 'import { ColorPickerComponent }'))->toBe(1);
    });
});

it('honors a --type override', function () {
    withFieldScaffold(function () {
        artisan('lattice:field', ['name' => 'Swatch', '--type' => 'form.color'])->assertSuccessful();

        expect(File::get(app_path('Forms/Fields/Swatch.php')))
            ->toContain("#[Component('form.color')]");

        expect(File::get(resource_path('js/lattice/fields/swatch.tsx')))
            ->toContain('RendererComponent<"form.color">');

        expect(File::get(resource_path('js/lattice/plugin.ts')))
            ->toContain('"form.color": eagerComponent(SwatchComponent)');
    });
});

it('registers multiple distinct fields without clobbering earlier ones', function () {
    withFieldScaffold(function () {
        artisan('lattice:field', ['name' => 'ColorPicker'])->assertSuccessful();
        artisan('lattice:field', ['name' => 'StarRating'])->assertSuccessful();

        $plugin = File::get(resource_path('js/lattice/plugin.ts'));

        expect($plugin)
            ->toContain('"form.color-picker": eagerComponent(ColorPickerComponent)')
            ->toContain('"form.star-rating": eagerComponent(StarRatingComponent)')
            ->toContain('import { ColorPickerComponent } from "./fields/color-picker";')
            ->toContain('import { StarRatingComponent } from "./fields/star-rating";');

        // Assert exact 4-space indentation for both entries — locks the indentation bug fix
        expect($plugin)
            ->toContain("  components: {\n    \"form.color-picker\": eagerComponent(ColorPickerComponent),\n    \"form.star-rating\": eagerComponent(StarRatingComponent),\n  },");
    });
});
