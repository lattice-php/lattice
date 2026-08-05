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
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Columns\Concerns\IsFilterable;
use Lattice\Lattice\Tables\Columns\Concerns\IsSearchable;
use Lattice\Lattice\Tables\Columns\Concerns\IsSortable;
use Lattice\Lattice\Tables\Columns\NumericColumn;
use Lattice\Lattice\Tables\Filters\Filter;
use Lattice\Lattice\Tables\Sources\Eloquent\EloquentTableDefinition;
use Lattice\Lattice\Tables\TableDefinition;
use Lattice\Lattice\Tables\TableRegistry;

const CORE_FORBIDDEN_NAMESPACES = [
    'Lattice\\Lattice\\Actions',
    'Lattice\\Lattice\\Forms',
    'Lattice\\Lattice\\Tables',
    'Lattice\\Lattice\\Fragments',
    'Lattice\\Lattice\\Layouts',
    'Lattice\\Lattice\\Ui',
    'Lattice\\Lattice\\Chat',
    'Lattice\\Lattice\\Notifications',
    'Lattice\\Lattice\\Realtime',
    'Lattice\\Lattice\\Remote',
    'Lattice\\Lattice\\Effects',
    'Lattice\\Lattice\\I18n',
];

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

arch('core does not depend on feature or ui domains')
    ->expect('Lattice\Lattice\Core')
    ->not->toUse(CORE_FORBIDDEN_NAMESPACES);

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

arch('attributes depend on no feature domain or higher layer')
    ->expect('Lattice\Lattice\Attributes')
    ->not->toUse([
        'Lattice\Lattice\Forms',
        'Lattice\Lattice\Tables',
        'Lattice\Lattice\Fragments',
        'Lattice\Lattice\Layouts',
        'Lattice\Lattice\Ui',
        'Lattice\Lattice\Http',
        'Lattice\Lattice\Console',
        'Lattice\Lattice\Facades',
    ]);

arch('the support utilities do not depend on the feature domains')
    ->expect([
        'Lattice\Lattice\Support\Evaluation',
        'Lattice\Lattice\Support\Discovery',
        'Lattice\Lattice\Support\TypeScript',
    ])
    ->not->toUse(CORE_FORBIDDEN_NAMESPACES);

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

arch('columns never depend on eloquent')
    ->expect('Lattice\Lattice\Tables\Columns')
    ->not->toUse('Illuminate\Database\Eloquent');

arch('table columns, table filters, and built-in effects are final')
    ->expect([
        'Lattice\Lattice\Tables\Columns',
        'Lattice\Lattice\Tables\Filters',
        'Lattice\Lattice\Effects\Builtin',
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
