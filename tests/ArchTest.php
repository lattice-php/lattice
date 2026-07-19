<?php
declare(strict_types=1);
use Illuminate\Support\Facades\Facade;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionRegistry;
use Lattice\Lattice\Actions\BulkActionDefinition;
use Lattice\Lattice\Actions\BulkActionRegistry;
use Lattice\Lattice\Actions\FormActionDefinition;
use Lattice\Lattice\Core\Definition;
use Lattice\Lattice\Core\DefinitionRegistry;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Forms\FormRegistry;
use Lattice\Lattice\Fragments\FragmentDefinition;
use Lattice\Lattice\Fragments\FragmentRegistry;
use Lattice\Lattice\Layouts\LayoutDefinition;
use Lattice\Lattice\Layouts\LayoutRegistry;
use Lattice\Lattice\Tables\Sources\Eloquent\EloquentTableDefinition;
use Lattice\Lattice\Tables\TableDefinition;
use Lattice\Lattice\Tables\TableRegistry;

/*
 * Layering.
 *
 * Bottom: the shared base — Core, Attributes, and the Support utilities — which
 * the rest of the package builds on and which never depend back on a feature
 * domain or an orchestration layer.
 *
 * Middle: the five feature domains. Each stays independent of its siblings; the
 * only intentional cross-domain couplings are tables -> actions (row and bulk
 * actions), tables -> forms (table filters are form-field schemas), actions ->
 * forms (action forms), and layouts -> actions (menu items that trigger an
 * action). The UI layer likewise reaches Actions in two deliberate spots — the
 * Triggerable primitive (links/buttons that trigger an action) and TreeNode
 * (which can hold a row action).
 *
 * Top: the orchestration and tooling layers — Http (which renders and routes
 * pages, including the page registry, by consuming the feature domains),
 * Console, and Facades. Nothing below may depend upward on them.
 */

arch('forms depend on no other feature domain')
    ->expect('Lattice\Lattice\Forms')
    ->not->toUse([
        'Lattice\Lattice\Actions',
        'Lattice\Lattice\Tables',
        'Lattice\Lattice\Fragments',
        'Lattice\Lattice\Layouts',
    ]);

arch('actions depend on no feature domain other than forms')
    ->expect('Lattice\Lattice\Actions')
    ->not->toUse([
        'Lattice\Lattice\Tables',
        'Lattice\Lattice\Fragments',
        'Lattice\Lattice\Layouts',
    ]);

arch('tables depend on no feature domain other than actions, forms, and fragments')
    ->expect('Lattice\Lattice\Tables')
    ->not->toUse([
        'Lattice\Lattice\Layouts',
    ]);

arch('fragments depend on no other feature domain')
    ->expect('Lattice\Lattice\Fragments')
    ->not->toUse([
        'Lattice\Lattice\Forms',
        'Lattice\Lattice\Tables',
        'Lattice\Lattice\Actions',
        'Lattice\Lattice\Layouts',
    ]);

arch('layouts depend on no feature domain other than actions')
    ->expect('Lattice\Lattice\Layouts')
    ->not->toUse([
        'Lattice\Lattice\Forms',
        'Lattice\Lattice\Tables',
        'Lattice\Lattice\Fragments',
    ]);

arch('core does not depend on the feature domains other than actions')
    ->expect('Lattice\Lattice\Core')
    ->not->toUse([
        'Lattice\Lattice\Forms',
        'Lattice\Lattice\Tables',
        'Lattice\Lattice\Fragments',
        'Lattice\Lattice\Layouts',
    ]);

arch('core does not depend upward on the orchestration or tooling layers')
    ->expect('Lattice\Lattice\Core')
    ->not->toUse([
        'Lattice\Lattice\Http',
        'Lattice\Lattice\Console',
        'Lattice\Lattice\Facades',
    ]);

arch('feature domains never depend upward on the orchestration or tooling layers')
    ->expect([
        'Lattice\Lattice\Forms',
        'Lattice\Lattice\Actions',
        'Lattice\Lattice\Tables',
        'Lattice\Lattice\Fragments',
        'Lattice\Lattice\Layouts',
    ])
    ->not->toUse([
        'Lattice\Lattice\Http',
        'Lattice\Lattice\Console',
    ]);

arch('the ui and secondary domains never depend upward on orchestration or tooling')
    ->expect([
        'Lattice\Lattice\Ui',
        'Lattice\Lattice\Chat',
        'Lattice\Lattice\Notifications',
        'Lattice\Lattice\Realtime',
        'Lattice\Lattice\Remote',
        'Lattice\Lattice\Effects',
        'Lattice\Lattice\I18n',
    ])
    ->not->toUse([
        'Lattice\Lattice\Http',
        'Lattice\Lattice\Console',
    ]);

/*
 * Attributes are a shared base layer of plain markers: they describe domain
 * objects without reaching into the domains. Actions is intentionally omitted
 * because it is a consumer of core domain objects (not a peer layer).
 */
arch('attributes depend on no feature domain or higher layer')
    ->expect('Lattice\Lattice\Attributes')
    ->not->toUse([
        'Lattice\Lattice\Forms',
        'Lattice\Lattice\Tables',
        'Lattice\Lattice\Fragments',
        'Lattice\Lattice\Layouts',
        'Lattice\Lattice\Http',
        'Lattice\Lattice\Console',
        'Lattice\Lattice\Facades',
    ]);

/*
 * The Support utilities (Evaluation, Discovery) are part of the shared base and
 * stay free of the feature domains. Support\Testing and Support\TypeScript are
 * tooling that intentionally consumes the domains, so they are not constrained.
 */
arch('the support utilities do not depend on the feature domains')
    ->expect([
        'Lattice\Lattice\Support\Evaluation',
        'Lattice\Lattice\Support\Discovery',
    ])
    ->not->toUse([
        'Lattice\Lattice\Forms',
        'Lattice\Lattice\Actions',
        'Lattice\Lattice\Tables',
        'Lattice\Lattice\Fragments',
        'Lattice\Lattice\Layouts',
    ]);

/*
 * Structural conventions.
 */

/*
 * Cross-boundary contracts live in a `Contracts` namespace and are interfaces.
 * Local capability interfaces that are not cross-boundary contracts, such as
 * Support\TypeScript\TypeScriptProfile, can sit beside their implementations.
 */
arch('contracts are interfaces')
    ->expect([
        'Lattice\Lattice\Core\Contracts',
        'Lattice\Lattice\Actions\Contracts',
        'Lattice\Lattice\Forms\Contracts',
        'Lattice\Lattice\Tables\Contracts',
        'Lattice\Lattice\Ui\Contracts',
    ])
    ->toBeInterfaces();

arch('domain registries extend the base definition registry')
    ->expect([
        ActionRegistry::class,
        BulkActionRegistry::class,
        FormRegistry::class,
        FragmentRegistry::class,
        LayoutRegistry::class,
        TableRegistry::class,
    ])
    ->toExtend(DefinitionRegistry::class);

/*
 * Every definition derives from Core\Definition, including the ones that extend
 * an intermediate base (FormActionDefinition, EloquentTableDefinition); a
 * transitive is_subclass_of check covers those, where ->toExtend would not.
 */
it('derives every definition from the base definition', function (string $definition): void {
    expect(is_subclass_of($definition, Definition::class))->toBeTrue();
})->with([
    ActionDefinition::class,
    BulkActionDefinition::class,
    FormActionDefinition::class,
    FormDefinition::class,
    FragmentDefinition::class,
    LayoutDefinition::class,
    TableDefinition::class,
    EloquentTableDefinition::class,
]);

arch('the lattice facade extends the laravel facade')
    ->expect('Lattice\Lattice\Facades')
    ->toExtend(Facade::class);

/*
 * Columns are a declarative layer: they describe what to render, never how to
 * fetch it. Eloquent is one table-source driver, so the column classes must not
 * reach for a model, query builder, or relation — the binding they expose
 * (RelationBinding) is plain data a driver interprets.
 */
arch('columns never depend on eloquent')
    ->expect('Lattice\Lattice\Tables\Columns')
    ->not->toUse('Illuminate\Database\Eloquent');

/*
 * Ui\Components is intentionally excluded here: "lattice component factories
 * stay open for extension" (tests/Unit/Core/ComponentSerializationTest.php)
 * asserts consumers may subclass a component (e.g. Badge) and keep the
 * static::make() factory working via late static binding, so those classes
 * must not be final.
 */
arch('table columns, table filters, and built-in effects are final')
    ->expect([
        'Lattice\Lattice\Tables\Columns',
        'Lattice\Lattice\Tables\Filters',
        'Lattice\Lattice\Effects\Builtin',
    ])
    ->toBeFinal()
    ->ignoring([
        'Lattice\Lattice\Tables\Columns\Column',
        'Lattice\Lattice\Tables\Columns\NumericColumn',
        'Lattice\Lattice\Tables\Columns\Concerns\IsFilterable',
        'Lattice\Lattice\Tables\Columns\Concerns\IsSearchable',
        'Lattice\Lattice\Tables\Columns\Concerns\IsSortable',
        'Lattice\Lattice\Tables\Filters\Filter',
    ]);

arch('no debug statements ship in the package')
    ->expect(['dd', 'ddd', 'dump', 'ray', 'var_dump', 'print_r'])
    ->not->toBeUsed();

arch('the package uses strict types throughout')
    ->expect('Lattice\Lattice')
    ->toUseStrictTypes();

it('uses lower-case translation keys separated by - or _', function (): void {
    $root = dirname(__DIR__);
    $violations = [];

    $inspect = function (array $translations, string $file, string $prefix = '') use (&$inspect, &$violations): void {
        foreach ($translations as $key => $value) {
            $path = $prefix === '' ? (string) $key : "{$prefix}.{$key}";

            if (preg_match('/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/D', (string) $key) !== 1) {
                $violations[] = "{$file}: {$path}";
            }

            if (is_array($value)) {
                $inspect($value, $file, $path);
            }
        }
    };

    foreach ([$root.'/lang', $root.'/workbench/lang'] as $directory) {
        $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory, FilesystemIterator::SKIP_DOTS));

        foreach ($files as $file) {
            if (! $file->isFile() || $file->getExtension() !== 'php') {
                continue;
            }

            $inspect(require $file->getPathname(), str_replace($root.'/', '', $file->getPathname()));
        }
    }

    expect($violations)->toBeEmpty(implode(PHP_EOL, $violations));
});
