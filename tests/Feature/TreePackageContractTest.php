<?php
declare(strict_types=1);

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Lattice\Lattice\Core\Discovery\ComponentPackages;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Lattice\Forms\FormsServiceProvider;
use Lattice\Lattice\Support\TypeScript\WireFamilies;
use Lattice\Lattice\Support\TypeScript\WireFamily;
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

    try {
        $application = new Application;
        $application->register(TreeServiceProvider::class);

        $categories = array_map(
            static fn (WireFamily $family): string => $family->category,
            $application->make(WireFamilies::class)->all(),
        );

        expect($application->getProvider(UiServiceProvider::class))->not->toBeNull()
            ->and($application->getProvider(FormsServiceProvider::class))->toBeNull()
            ->and($application->getProvider(TablesServiceProvider::class))->toBeNull()
            ->and($categories)->toBe(['component', 'effect']);
    } finally {
        Application::setInstance($testApplication);
    }
});

it('contributes discovery and frontend entries', function (): void {
    $package = collect(ComponentPackages::packages())->firstWhere('name', 'lattice-php/tree');
    $packagePath = realpath(dirname(__DIR__, 2).'/packages/tree');

    expect($packagePath)->not->toBeFalse()
        ->and($package)->toMatchArray([
            'roots' => [$packagePath.'/src'],
            'plugin' => $packagePath.'/resources/js/plugin.ts',
            'standalone' => $packagePath.'/dist/plugin.js',
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
