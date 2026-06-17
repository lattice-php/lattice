<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\Testing\Assertions;

use Closure;
use Lattice\Lattice\Support\Testing\ComponentNode;
use PHPUnit\Framework\Assert;

final readonly class TableAssertions
{
    public function __construct(
        private ComponentNode $node,
        private ComponentAssertions $root,
    ) {}

    public function filter(string $key, ?Closure $tap = null): FilterAssertions|self
    {
        $filter = $this->filterFor($key);

        Assert::assertNotNull($filter, sprintf(
            'Expected table [%s] to have filter [%s]. Available filters: [%s].',
            $this->node->id() ?? '*',
            $key,
            implode(', ', $this->filterKeys()),
        ));

        $assertions = new FilterAssertions($key, $filter, $this);

        if ($tap instanceof Closure) {
            $tap($assertions);

            return $this;
        }

        return $assertions;
    }

    public function assertHasFilter(string $key): self
    {
        Assert::assertNotNull($this->filterFor($key), sprintf(
            'Expected table [%s] to have filter [%s]. Available filters: [%s].',
            $this->node->id() ?? '*',
            $key,
            implode(', ', $this->filterKeys()),
        ));

        return $this;
    }

    public function assertMissingFilter(string $key): self
    {
        Assert::assertNull($this->filterFor($key), sprintf(
            'Expected table [%s] to NOT have filter [%s], but it does.',
            $this->node->id() ?? '*',
            $key,
        ));

        return $this;
    }

    public function assertHasColumn(string $key): self
    {
        Assert::assertNotNull($this->columnFor($key), sprintf(
            'Expected table [%s] to have column [%s]. Available columns: [%s].',
            $this->node->id() ?? '*',
            $key,
            implode(', ', array_map(static fn (array $c): string => (string) ($c['key'] ?? '?'), $this->columns())),
        ));

        return $this;
    }

    public function assertHasBulkAction(string $id): self
    {
        Assert::assertNotNull(
            $this->node->firstOfType('action', $id),
            sprintf('Expected table [%s] to have bulk action [%s].', $this->node->id() ?? '*', $id),
        );

        return $this;
    }

    public function end(): ComponentAssertions
    {
        return $this->root;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function columns(): array
    {
        $columns = $this->node->prop('columns');

        return is_array($columns) ? array_values(array_filter($columns, is_array(...))) : [];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function columnFor(string $key): ?array
    {
        foreach ($this->columns() as $column) {
            if (($column['key'] ?? null) === $key) {
                return $column;
            }
        }

        return null;
    }

    /**
     * @return array<string, mixed>|null
     */
    private function filterFor(string $key): ?array
    {
        $column = $this->columnFor($key);
        $filter = $column['filter'] ?? null;

        if (is_array($filter) && ($filter['enabled'] ?? false) === true) {
            return $filter;
        }

        return null;
    }

    /**
     * @return array<int, string>
     */
    private function filterKeys(): array
    {
        $keys = [];

        foreach ($this->columns() as $column) {
            $filter = $column['filter'] ?? null;

            if (is_array($filter) && ($filter['enabled'] ?? false) === true) {
                $keys[] = (string) ($column['key'] ?? '?');
            }
        }

        return $keys;
    }
}
