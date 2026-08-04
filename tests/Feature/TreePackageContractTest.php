<?php
declare(strict_types=1);

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Facade;
use Lattice\Lattice\Core\Discovery\ComponentPackages;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Forms\FormsServiceProvider;
use Lattice\Lattice\LatticeRegistry;
use Lattice\Lattice\Support\TypeScript\WireTypeDiscovery;
use Lattice\Lattice\Tables\TablesServiceProvider;
use Lattice\Lattice\Ui\UiServiceProvider;
use Lattice\Tree\AsTree;
use Lattice\Tree\CallbackTreeSource;
use Lattice\Tree\Tree;
use Lattice\Tree\TreeDefinition;
use Lattice\Tree\TreeRegistry;
use Lattice\Tree\TreeServiceProvider;

it('boots the tree package through the ui boundary', function (): void {
    expect(class_exists(TreeServiceProvider::class))->toBeTrue();

    $testApplication = Application::getInstance();
    $testFacadeApplication = Facade::getFacadeApplication();

    try {
        $application = new Application;
        Facade::setFacadeApplication($application);
        Lattice::clearResolvedInstance();
        $application->register(TreeServiceProvider::class);

        $categories = $application->make(LatticeRegistry::class)->wireFamilies()->keys()->all();

        expect($application->getProvider(UiServiceProvider::class))->not->toBeNull()
            ->and($application->getProvider(FormsServiceProvider::class))->toBeNull()
            ->and($application->getProvider(TablesServiceProvider::class))->toBeNull()
            ->and($categories)->toBe(['component', 'effect']);
    } finally {
        Application::setInstance($testApplication);
        Facade::setFacadeApplication($testFacadeApplication);
        Lattice::clearResolvedInstance();
    }
});

it('depends on core and ui instead of the aggregate package', function (): void {
    $package = json_decode(
        (string) file_get_contents(dirname(__DIR__, 2).'/packages/tree/composer.json'),
        true,
        flags: JSON_THROW_ON_ERROR,
    );

    expect($package['require'])
        ->toHaveKeys(['lattice-php/core', 'lattice-php/ui'])
        ->not->toHaveKey('lattice-php/lattice');
});

it('contributes discovery and frontend entries', function (): void {
    $package = collect(ComponentPackages::packages())->firstWhere('name', 'lattice-php/tree');
    $packagePath = realpath(dirname(__DIR__, 2).'/packages/tree');

    expect($packagePath)->not->toBeFalse()
        ->and($package)->toMatchArray([
            'roots' => [$packagePath.'/src'],
            'plugin' => $packagePath.'/resources/js/plugin.ts',
            'standalone' => $packagePath.'/dist/standalone.js',
        ]);

    $types = [];

    foreach (DiscoveryManifest::configuredPaths() as $path) {
        foreach (app(WireTypeDiscovery::class)->discover($path)->components as $component) {
            $types[] = $component->type;
        }
    }

    expect($types)->toContain('tree');
});

it('uses the core definition gate', function (): void {
    app()->register(TreeServiceProvider::class);
    app(TreeRegistry::class)->register(DeniedPackageTree::class);

    expect(Tree::use(DeniedPackageTree::class)->shouldRender())->toBeFalse();
});

#[AsTree('denied-package-tree')]
final class DeniedPackageTree extends TreeDefinition
{
    #[Override]
    public function authorize(Request $request): bool
    {
        return false;
    }

    public function source(): CallbackTreeSource
    {
        return new CallbackTreeSource(roots: static fn (): array => []);
    }
}
