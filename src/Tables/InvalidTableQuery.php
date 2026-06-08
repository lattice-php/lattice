<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Tables;

use RuntimeException;

class InvalidTableQuery extends RuntimeException
{
    /**
     * @param  array<string, array<int, string>>  $errors
     */
    public function __construct(string $message, public readonly array $errors = [])
    {
        parent::__construct($message);
    }

    public static function filter(string $filter, string $table): self
    {
        $message = "Filter [{$filter}] is not allowed for table [{$table}].";

        return new self($message, ['filter' => [$message]]);
    }

    public static function sort(string $sort, string $table): self
    {
        $message = "Sort [{$sort}] is not allowed for table [{$table}].";

        return new self($message, ['sort' => [$message]]);
    }
}
