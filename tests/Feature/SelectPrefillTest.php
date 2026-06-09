<?php

declare(strict_types=1);

use Bambamboole\Lattice\Components\Form\Form;
use Bambamboole\Lattice\Components\Form\Select;

/**
 * @return array<int, array{label: string, value: string}>
 */
function prefilledOptions(Form $form): array
{
    return $form->toArray()['children'][0]['props']['options'] ?? [];
}

it('resolves the label for a single filled id', function (): void {
    $form = Form::make('f')
        ->fill(['author_id' => '5'])
        ->schema([
            Select::make('author_id', 'Author')
                ->searchable(fn (string $query) => [])
                ->resolveSelectedUsing(fn (array $values) => collect($values)
                    ->map(fn (string $id) => Select::option("User {$id}", $id))
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
                ->searchable(fn (string $query) => [])
                ->resolveSelectedUsing(fn (array $values) => collect($values)
                    ->map(fn (string $id) => Select::option("Tag {$id}", $id))
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
                ->resolveSelectedUsing(function (array $values) use (&$received) {
                    $received = $values;

                    return [];
                }),
        ]);

    $form->toArray();

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
                ->resolveSelectedUsing(function (array $values) use (&$resolved) {
                    $resolved = true;

                    return [];
                }),
        ]);

    $form->toArray();

    expect($resolved)->toBeFalse();
});
