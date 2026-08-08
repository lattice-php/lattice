<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Core\Contracts\OptionSource;
use Lattice\Core\Option;
use Lattice\Form\Components\Select;
use Lattice\Form\FormData;

function arrayOptionSource(): OptionSource
{
    return inMemoryOptionSource(['1' => 'Ada', '2' => 'Linus', '3' => 'Grace']);
}

it('marks a select searchable once an option source is attached', function (): void {
    expect(Select::make('author_id')->optionsFrom(arrayOptionSource())->isSearchable())->toBeTrue();
});

it('resolves search options through the option source', function (): void {
    $select = Select::make('author_id')->optionsFrom(arrayOptionSource());

    $options = $select->resolveSearch('lin', FormData::make([]), Request::create('/'));

    expect($options)->toHaveCount(1)
        ->and($options[0]->label)->toBe('Linus')
        ->and($options[0]->value)->toBe('2');
});

it('prefills a selected value label through the option source', function (): void {
    $select = Select::make('author_id')->optionsFrom(arrayOptionSource());

    $select->hydrateState('2');

    expect($select->options)->toHaveCount(1)
        ->and($select->options[0]->label)->toBe('Linus')
        ->and($select->options[0]->value)->toBe('2');
});

it('prefills multiple selected values for a multiple select', function (): void {
    $select = Select::make('authors')->multiple()->optionsFrom(arrayOptionSource());

    $select->hydrateState(['1', '3']);

    expect(array_map(fn (Option $o): string => $o->label, $select->options))->toBe(['Ada', 'Grace']);
});
