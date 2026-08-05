<?php
declare(strict_types=1);
use Illuminate\Support\Facades\Facade;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionRegistry;
use Lattice\Actions\BulkActionDefinition;
use Lattice\Actions\BulkActionRegistry;
use Lattice\Actions\FormActionDefinition;
use Lattice\Core\Definition;
use Lattice\Core\DefinitionRegistry;
use Lattice\Core\Facades\Lattice as LatticeFacade;
use Lattice\Core\LatticeRegistry;
use Lattice\Form\FormDefinition;
use Lattice\Form\FormRegistry;
use Lattice\Fragments\FragmentDefinition;
use Lattice\Fragments\FragmentRegistry;
use Lattice\Layouts\LayoutDefinition;
use Lattice\Layouts\LayoutRegistry;
use Lattice\Table\Columns\Column;
use Lattice\Table\Columns\Concerns\IsFilterable;
use Lattice\Table\Columns\Concerns\IsSearchable;
use Lattice\Table\Columns\Concerns\IsSortable;
use Lattice\Table\Columns\NumericColumn;
use Lattice\Table\Filters\Filter;
use Lattice\Table\Sources\Eloquent\EloquentTableDefinition;
use Lattice\Table\TableDefinition;
use Lattice\Table\TableRegistry;

const CORE_FORBIDDEN_NAMESPACES = [
    'Lattice\\Actions',
    'Lattice\\Form',
    'Lattice\\Table',
    'Lattice\\Fragments',
    'Lattice\\Layouts',
    'Lattice\\Ui',
    'Lattice\\Chat',
    'Lattice\\Notifications',
    'Lattice\\Realtime',
    'Lattice\\Remote',
];

arch('forms depend on no other feature domain')
    ->expect('Lattice\Form')
    ->not->toUse([
        'Lattice\Actions',
        'Lattice\Table',
        'Lattice\Fragments',
        'Lattice\Layouts',
    ]);

arch('actions depend on no feature domain other than forms')
    ->expect('Lattice\Actions')
    ->not->toUse([
        'Lattice\Table',
        'Lattice\Fragments',
        'Lattice\Layouts',
    ]);

arch('tables depend on no feature domain other than actions, forms, and fragments')
    ->expect('Lattice\Table')
    ->not->toUse([
        'Lattice\Layouts',
    ]);

arch('fragments depend on no other feature domain')
    ->expect('Lattice\Fragments')
    ->not->toUse([
        'Lattice\Form',
        'Lattice\Table',
        'Lattice\Actions',
        'Lattice\Layouts',
    ]);

arch('layouts depend on no feature domain other than actions')
    ->expect('Lattice\Layouts')
    ->not->toUse([
        'Lattice\Form',
        'Lattice\Table',
        'Lattice\Fragments',
    ]);

arch('core internals do not depend on feature or ui domains')
    ->expect('Lattice\Core')
    ->not->toUse(CORE_FORBIDDEN_NAMESPACES)
    ->ignoring([LatticeFacade::class, LatticeRegistry::class]);

arch('core internals do not depend upward on the orchestration or tooling layers')
    ->expect('Lattice\Core')
    ->not->toUse([
        'Lattice\Http',
        'Lattice\Console',
        'Lattice\Facades',
    ])
    ->ignoring([LatticeFacade::class, LatticeRegistry::class]);

arch('feature domains never depend upward on the orchestration or tooling layers')
    ->expect([
        'Lattice\Form',
        'Lattice\Actions',
        'Lattice\Table',
        'Lattice\Fragments',
        'Lattice\Layouts',
    ])
    ->not->toUse([
        'Lattice\Http',
        'Lattice\Console',
    ]);

arch('the ui and secondary domains never depend upward on orchestration or tooling')
    ->expect([
        'Lattice\Ui',
        'Lattice\Chat',
        'Lattice\Notifications',
        'Lattice\Realtime',
        'Lattice\Remote',
    ])
    ->not->toUse([
        'Lattice\Http',
        'Lattice\Console',
    ]);

arch('attributes depend on no feature domain or higher layer')
    ->expect('Lattice\Core\Attributes')
    ->not->toUse([
        'Lattice\Form',
        'Lattice\Table',
        'Lattice\Fragments',
        'Lattice\Layouts',
        'Lattice\Ui',
        'Lattice\Http',
        'Lattice\Console',
        'Lattice\Facades',
    ]);

arch('the support utilities do not depend on the feature domains')
    ->expect([
        'Lattice\Core\Support\Evaluation',
        'Lattice\Core\Support\Discovery',
        'Lattice\Support\TypeScript',
    ])
    ->not->toUse(CORE_FORBIDDEN_NAMESPACES);

arch('contracts are interfaces')
    ->expect([
        'Lattice\Core\Contracts',
        'Lattice\Actions\Contracts',
        'Lattice\Form\Contracts',
        'Lattice\Table\Contracts',
        'Lattice\Ui\Contracts',
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
    ->expect([
        'Lattice\Core\Facades',
        'Lattice\Facades',
    ])
    ->toExtend(Facade::class);

arch('columns never depend on eloquent')
    ->expect('Lattice\Table\Columns')
    ->not->toUse('Illuminate\Database\Eloquent');

arch('table columns, table filters, and built-in effects are final')
    ->expect([
        'Lattice\Table\Columns',
        'Lattice\Table\Filters',
        'Lattice\Ui\Effects\Builtin',
    ])
    ->toBeFinal()
    ->ignoring([
        Column::class,
        NumericColumn::class,
        IsFilterable::class,
        IsSearchable::class,
        IsSortable::class,
        Filter::class,
    ]);

arch('no debug statements ship in the package')
    ->expect(['dd', 'ddd', 'dump', 'ray', 'var_dump', 'print_r'])
    ->not->toBeUsed();

arch('the package uses strict types throughout')
    ->expect('Lattice')
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

    foreach ([...glob($root.'/packages/*/lang') ?: [], $root.'/workbench/lang'] as $directory) {
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
