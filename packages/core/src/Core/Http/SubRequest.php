<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Http;

use Illuminate\Http\Request;

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
