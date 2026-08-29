<?php
declare(strict_types=1);

namespace Lattice\Board;

use Illuminate\Http\Request;
use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
final readonly class BoardQuery
{
    private function __construct(
        public ?string $column,
        public int $offset,
        public int $limit,
        public string $search,
    ) {}

    public static function empty(int $limit = 25): self
    {
        return new self(null, 0, self::clampLimit($limit), '');
    }

    /**
     * Reads `column`, `offset`, `limit`, and `q` off the request, clamping
     * offset and limit into safe bounds. `$board` names the requesting board
     * for future validation errors; the column itself is checked against the
     * definition's declared columns by the registry, which is the only place
     * that knows them.
     */
    public static function fromRequest(Request $request, string $board, int $limit = 25): self
    {
        $column = $request->string('column')->trim()->toString();

        return new self(
            $column === '' ? null : $column,
            self::clampOffset($request->integer('offset', 0)),
            self::clampLimit($request->integer('limit', $limit)),
            $request->string('q')->trim()->toString(),
        );
    }

    private static function clampOffset(int $offset): int
    {
        return max(0, $offset);
    }

    private static function clampLimit(int $limit): int
    {
        return max(1, min(100, $limit));
    }
}
