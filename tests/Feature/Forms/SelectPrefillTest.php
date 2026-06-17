<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Forms\Components\Block;
use Lattice\Lattice\Forms\Components\Builder;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\Repeater;
use Lattice\Lattice\Forms\Components\Select;

/**
 * @return array<int, array{label: string, value: string}>
 */
function prefilledOptions(Form $form): array
{
    return wire($form)['schema'][0]['props']['options'] ?? [];
}

/**
 * @return array<int, array{label: string, value: string}>
 */
function repeaterPrefilledOptions(Form $form): array
{
    return wire($form)['schema'][0]['schema'][0]['props']['options'] ?? [];
}

/**
 * @return array<int, array{label: string, value: string}>
 */
function nestedRepeaterPrefilledOptions(Form $form): array
{
    return wire($form)['schema'][0]['schema'][0]['schema'][0]['props']['options'] ?? [];
}

/**
 * @return array<int, array{label: string, value: string}>
 */
function builderPrefilledOptions(Form $form): array
{
    return wire($form)['schema'][0]['blocks'][0]['schema'][0]['props']['options'] ?? [];
}

it('resolves the label for a single filled id', function (): void {
    $form = Form::make('f')
        ->fill(['author_id' => '5'])
        ->schema([
            Select::make('author_id', 'Author')
                ->searchable(fn (string $search): array => [])
                ->resolveSelectedUsing(fn (array $values) => collect($values)
                    ->map(fn (string $id): Option => Select::option("User {$id}", $id))
                    ->all()),
        ]);

    expect(prefilledOptions($form))->toBe([
        ['label' => 'User 5', 'value' => '5'],
    ]);
});

it('resolves labels for multiple filled ids', function (): void {
    $form = Form::make('f')
        ->fill(['tags' => ['1', '2']])
        ->schema([
            Select::make('tags', 'Tags')
                ->multiple()
                ->searchable(fn (string $search): array => [])
                ->resolveSelectedUsing(fn (array $values) => collect($values)
                    ->map(fn (string $id): Option => Select::option("Tag {$id}", $id))
                    ->all()),
        ]);

    expect(prefilledOptions($form))->toBe([
        ['label' => 'Tag 1', 'value' => '1'],
        ['label' => 'Tag 2', 'value' => '2'],
    ]);
});

it('passes a single value to the resolver as a one-element array', function (): void {
    $received = null;

    $form = Form::make('f')
        ->fill(['author_id' => '7'])
        ->schema([
            Select::make('author_id', 'Author')
                ->resolveSelectedUsing(function (array $values) use (&$received): array {
                    $received = $values;

                    return [];
                }),
        ]);

    wire($form);

    expect($received)->toBe(['7']);
});

it('does nothing when the field has no resolver', function (): void {
    $form = Form::make('f')
        ->fill(['plan' => 'pro'])
        ->schema([
            Select::make('plan', 'Plan')->options([Select::option('Pro', 'pro')]),
        ]);

    expect(prefilledOptions($form))->toBe([
        ['label' => 'Pro', 'value' => 'pro'],
    ]);
});

it('does not resolve when there is no filled value', function (): void {
    $resolved = false;

    $form = Form::make('f')
        ->schema([
            Select::make('author_id', 'Author')
                ->resolveSelectedUsing(function (array $values) use (&$resolved): array {
                    $resolved = true;

                    return [];
                }),
        ]);

    wire($form);

    expect($resolved)->toBeFalse();
});

it('resolves labels for filled ids inside repeater rows', function (): void {
    $received = null;

    $form = Form::make('f')
        ->fill(['items' => [
            ['product' => '5'],
            ['product' => '8'],
        ]])
        ->schema([
            Repeater::make('items')->schema([
                Select::make('product', 'Product')
                    ->resolveSelectedUsing(function (array $values) use (&$received) {
                        $received = $values;

                        return collect($values)
                            ->map(fn (string $id): Option => Select::option("Product {$id}", $id))
                            ->all();
                    }),
            ]),
        ]);

    expect(repeaterPrefilledOptions($form))->toBe([
        ['label' => 'Product 5', 'value' => '5'],
        ['label' => 'Product 8', 'value' => '8'],
    ])->and($received)->toBe(['5', '8']);
});

it('resolves labels for filled ids inside builder rows', function (): void {
    $received = null;

    $form = Form::make('f')
        ->fill(['items' => [
            ['type' => 'product', 'product' => '5'],
            ['type' => 'product', 'product' => '8'],
        ]])
        ->schema([
            Builder::make('items')->blocks([
                Block::make('product')->schema([
                    Select::make('product', 'Product')
                        ->resolveSelectedUsing(function (array $values) use (&$received) {
                            $received = $values;

                            return collect($values)
                                ->map(fn (string $id): Option => Select::option("Product {$id}", $id))
                                ->all();
                        }),
                ]),
            ]),
        ]);

    expect(builderPrefilledOptions($form))->toBe([
        ['label' => 'Product 5', 'value' => '5'],
        ['label' => 'Product 8', 'value' => '8'],
    ])->and($received)->toBe(['5', '8']);
});

it('resolves labels for filled ids inside nested repeater rows', function (): void {
    $received = null;

    $form = Form::make('f')
        ->fill(['sections' => [[
            'items' => [
                ['product' => '5'],
                ['product' => '8'],
            ],
        ]]])
        ->schema([
            Repeater::make('sections')->schema([
                Repeater::make('items')->schema([
                    Select::make('product', 'Product')
                        ->resolveSelectedUsing(function (array $values) use (&$received) {
                            $received = $values;

                            return collect($values)
                                ->map(fn (string $id): Option => Select::option("Product {$id}", $id))
                                ->all();
                        }),
                ]),
            ]),
        ]);

    expect(nestedRepeaterPrefilledOptions($form))->toBe([
        ['label' => 'Product 5', 'value' => '5'],
        ['label' => 'Product 8', 'value' => '8'],
    ])->and($received)->toBe(['5', '8']);
});
