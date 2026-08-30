<?php
declare(strict_types=1);

namespace Lattice\Board;

use Illuminate\Http\Request;
use Lattice\Core\Attributes\TypeScript;
use Lattice\Table\Filters\Filter;
use Lattice\Table\Filters\FilterIndicator;
use Lattice\Table\Filters\TableFilterParser;

#[TypeScript]
final readonly class BoardQuery
{
    /**
     * @param  array<string, array<string, mixed>>  $tableFilters
     * @param  list<FilterIndicator>  $tableFilterIndicators
     */
    private function __construct(
        public ?string $column,
        public int $offset,
        public int $limit,
        public string $search,
        public array $tableFilters = [],
        public array $tableFilterIndicators = [],
    ) {}

    public static function empty(int $limit = 25): self
    {
        return new self(null, 0, self::clampLimit($limit), '', [], []);
    }

    /**
     * Reads `column`, `offset`, `limit`, `q`, and `tf` off the request,
     * clamping offset and limit into safe bounds and validating `tf` against
     * the board's declared filters. `$board` names the requesting board for
     * validation errors; the column itself is checked against the
     * definition's declared columns by the registry, which is the only place
     * that knows them.
     *
     * @param  list<Filter>  $filters
     */
    public static function fromRequest(Request $request, string $board, int $limit = 25, array $filters = []): self
    {
        $column = $request->string('column')->trim()->toString();

        [$tableFilters, $tableFilterIndicators] = TableFilterParser::parse($request->input('tf'), $filters, $board, $request);

        return new self(
            $column === '' ? null : $column,
            self::clampOffset($request->integer('offset', 0)),
            self::clampLimit($request->integer('limit', $limit)),
            $request->string('q')->trim()->toString(),
            $tableFilters,
            $tableFilterIndicators,
        );
    }

    /**
     * Seeds the initial page render from the URL for a board opted into
     * `syncsQueryToUrl()`: only `q` and `tf` are restored, tolerantly. `column`,
     * `offset`, and `limit` are never read from the URL here — a URL-supplied
     * `column` would collapse the initial render to a single column, and
     * load-more offset/limit state is ephemeral by design.
     *
     * @param  list<Filter>  $filters
     */
    public static function forPage(Request $request, string $board, int $limit, array $filters): self
    {
        [$tableFilters, $tableFilterIndicators] = TableFilterParser::parse($request->input('tf'), $filters, $board, $request, strict: false);

        return new self(
            null,
            0,
            self::clampLimit($limit),
            $request->string('q')->trim()->toString(),
            $tableFilters,
            $tableFilterIndicators,
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
