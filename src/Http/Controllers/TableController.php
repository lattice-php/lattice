<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Http\Controllers;

use Bambamboole\Lattice\Tables\InvalidTableQuery;
use Bambamboole\Lattice\Tables\TableRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TableController
{
    public function __construct(private readonly TableRegistry $tables) {}

    public function __invoke(Request $request, string $table): JsonResponse
    {
        try {
            return response()->json($this->tables->response($table, $request));
        } catch (InvalidTableQuery $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }
    }
}
