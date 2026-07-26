<?php
declare(strict_types=1);

namespace Lattice\Lattice\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Lattice\Lattice\Core\Contracts\SignsComponentReferences;

final readonly class RefRefreshController
{
    public function __construct(private SignsComponentReferences $references) {}

    public function __invoke(Request $request): JsonResponse
    {
        $ref = $request->string('ref')->toString();
        abort_if($ref === '', 403);

        $refreshed = $this->references->refresh($ref);

        abort_if($refreshed === null, 403);

        return response()->json(['ref' => $refreshed]);
    }
}
