<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables;

/**
 * A column's declaration that its value comes from a relation, rather than a
 * plain attribute. This is pure data: it names the relation, the field to read,
 * and whether the relation is to-many. A table source driver interprets it —
 * the Eloquent driver eager-loads and projects it, but a column never reaches
 * for a query builder itself.
 */
final readonly class RelationBinding
{
    public function __construct(
        public string $relation,
        public string $field,
        public bool $many,
        public ?string $colorField = null,
    ) {}
}
