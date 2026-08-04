<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

    public function render(Request $request): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'errors' => $this->errors,
        ], 422);
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

    public static function operator(string $operator, string $field, string $table): self
    {
        $message = "Operator [{$operator}] is not allowed for filter [{$field}] on table [{$table}].";

        return new self($message, ['filter' => [$message]]);
    }

    public static function value(string $value, string $field, string $table): self
    {
        $message = "Value [{$value}] is not valid for filter [{$field}] on table [{$table}].";

        return new self($message, ['filter' => [$message]]);
    }
}
