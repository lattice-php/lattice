<?php
declare(strict_types=1);

use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

use function Pest\Laravel\artisan;

it('scaffolds a component class with the AsComponent attribute and registers it', function (): void {
    withRegistryScaffold(function (): void {
        artisan('lattice:component', ['name' => 'Rating'])->assertSuccessful();

        $php = File::get(app_path('Components/Rating.php'));
        expect($php)
            ->toContain('namespace App\\Components;')
            ->toContain('use Lattice\\Lattice\\Attributes\\AsComponent;')
            ->toContain("#[AsComponent('rating')]")
            ->toContain('class Rating extends Component');

        expect(File::get(resource_path('js/components/rating.tsx')))
            ->toContain('RendererComponent<"rating">');

        expect(File::get(resource_path('js/registry.ts')))
            ->toContain('import { RatingComponent } from "./components/rating";')
            ->toContain('"rating": eagerComponent(RatingComponent)');
    });
});

it('scaffolds into a Composer package via --package', function (): void {
    $dir = sys_get_temp_dir().'/lattice-pkg-'.Str::random(8);
    File::ensureDirectoryExists($dir);
    File::put($dir.'/composer.json', (string) json_encode([
        'name' => 'acme/widgets',
        'autoload' => ['psr-4' => ['Acme\\Widgets\\' => 'src/']],
    ]));

    try {
        artisan('lattice:component', ['name' => 'Widget', '--package' => $dir])->assertSuccessful();

        expect(File::get($dir.'/src/Components/Widget.php'))
            ->toContain('namespace Acme\\Widgets\\Components;')
            ->toContain("#[AsComponent('widget')]");

        expect(File::exists($dir.'/resources/js/widget.tsx'))->toBeTrue();

        expect(File::get($dir.'/resources/js/plugin.ts'))
            ->toContain('createPlugin')
            ->toContain('import { WidgetComponent } from "./widget";')
            ->toContain('"widget": eagerComponent(WidgetComponent)');
    } finally {
        File::deleteDirectory($dir);
    }
});

it('scaffolds a new package on first component when composer.json is absent', function (): void {
    $dir = sys_get_temp_dir().'/lattice-new-'.Str::random(8).'/acme-signature';

    try {
        artisan('lattice:component', ['name' => 'Signature', '--package' => $dir])->assertSuccessful();

        $composer = json_decode(File::get($dir.'/composer.json'), true);
        expect($composer['name'])->toBe('acme/signature')
            ->and($composer['autoload']['psr-4'])->toHaveKey('Acme\\Signature\\')
            ->and($composer['extra']['lattice'])->toBe([
                'plugin' => 'resources/js/plugin.ts',
                'discover' => ['src'],
            ]);

        expect(File::get($dir.'/src/Components/Signature.php'))
            ->toContain('namespace Acme\\Signature\\Components;');
        expect(File::get($dir.'/resources/js/plugin.ts'))
            ->toContain('"signature": eagerComponent(SignatureComponent)');
    } finally {
        File::deleteDirectory(dirname($dir));
    }
});

it('honors a --type override', function (): void {
    withRegistryScaffold(function (): void {
        artisan('lattice:component', ['name' => 'Stars', '--type' => 'rating.stars'])->assertSuccessful();

        expect(File::get(app_path('Components/Stars.php')))->toContain("#[AsComponent('rating.stars')]");
    });
});
