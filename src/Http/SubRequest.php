<?php
declare(strict_types=1);

namespace Lattice\Lattice\Http;

use Illuminate\Http\Request;

/**
 * The envelope every component sub-request travels in: `_sub` names the
 * type, `_target` the addressed field or filter, `_q` the user's query.
 * Reserved keys are underscore-prefixed so they cannot collide with field
 * names, and every endpoint parses the same shape.
 */
final readonly class SubRequest
{
    private function __construct(
        public SubRequestType $type,
        public string $target,
        public string $query,
    ) {}

    public static function from(Request $request): ?self
    {
        $type = SubRequestType::tryFrom($request->string('_sub')->toString());

        if ($type === null) {
            return null;
        }

        return new self(
            $type,
            $request->string('_target')->toString(),
            $request->string('_q')->toString(),
        );
    }
}
