<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\Testing\Assertions;

use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Tables\Enums\FilterType;
use PHPUnit\Framework\Assert;

final readonly class FilterAssertions
{
    /**
     * @param  array<string, mixed>  $filter
     */
    public function __construct(
        private string $key,
        private array $filter,
        private TableAssertions $table,
    ) {}

    public function assertType(FilterType $type): self
    {
        Assert::assertSame($type->value, $this->filter['type'] ?? null, sprintf(
            'Expected filter [%s] to be of type [%s].',
            $this->key,
            $type->value,
        ));

        return $this;
    }

    /**
     * @param  array<int, Op>  $operators
     */
    public function assertOperators(array $operators): self
    {
        $expected = array_map(static fn (Op $op): string => $op->value, $operators);

        Assert::assertSame($expected, $this->filter['operators'] ?? null, sprintf(
            'Expected filter [%s] operators to match.',
            $this->key,
        ));

        return $this;
    }

    public function assertDefaultOperator(Op $operator): self
    {
        Assert::assertSame($operator->value, $this->filter['defaultOperator'] ?? null, sprintf(
            'Expected filter [%s] default operator to be [%s].',
            $this->key,
            $operator->value,
        ));

        return $this;
    }

    public function end(): TableAssertions
    {
        return $this->table;
    }
}
