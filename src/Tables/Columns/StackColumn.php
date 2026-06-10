<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

class StackColumn extends Column
{
    /**
     * @var array<int, Column>
     */
    protected array $columns = [];

    /**
     * @param  array<int, Column>  $columns
     */
    public function columns(array $columns): static
    {
        $this->columns = $columns;

        return $this;
    }

    /**
     * @return array<string, mixed>
     */
    #[\Override]
    public function toArray(): array
    {
        return array_filter([
            ...parent::toArray(),
            'type' => 'stack',
            'columns' => array_map(
                fn (Column $column): array => $column->toArray(),
                $this->columns,
            ),
        ], fn (mixed $value): bool => $value !== null && $value !== []);
    }
}
