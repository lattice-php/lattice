<?php
declare(strict_types=1);

namespace Workbench\App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final readonly class FakeExternalCustomersController
{
    public function __invoke(Request $request): JsonResponse
    {
        abort_unless($request->bearerToken() === 'fake-workbench-crm-token', 403);

        return response()->json([
            'data' => [
                ['id' => 1, 'name' => 'Ada Lovelace'],
                ['id' => 2, 'name' => 'Grace Hopper'],
            ],
        ]);
    }
}
