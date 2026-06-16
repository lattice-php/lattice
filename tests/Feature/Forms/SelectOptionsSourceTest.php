<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Core\Contracts\OptionSource;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Forms\Components\Select;
use Lattice\Lattice\Forms\FormData;

/** An in-memory option source — proves the Select talks only to the contract, never Eloquent. */
function arrayOptionSource(): OptionSource
{
    return new class implements OptionSource
    {
        /** @var array<int|string, string> */
        private array $people = ['1' => 'Ada', '2' => 'Linus', '3' => 'Grace'];

        public function search(string $query): array
        {
            $matches = $query === ''
                ? $this->people
                : array_filter($this->people, fn (string $name): bool => str_contains(strtolower($name), strtolower($query)));

            return array_map(
                fn (string $name, int|string $id): Option => new Option($name, (string) $id),
                $matches,
                array_keys($matches),
            );
        }

        public function selected(array $values): array
        {
            return array_map(
                fn (string $id): Option => new Option($this->people[$id] ?? "User {$id}", $id),
                $values,
            );
        }
    };
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
