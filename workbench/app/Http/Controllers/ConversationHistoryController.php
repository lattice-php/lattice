<?php

declare(strict_types=1);

namespace Workbench\App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Workbench\App\Chat\FakeConversationStore;

final class ConversationHistoryController
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'messages' => app(FakeConversationStore::class)->messages(),
        ]);
    }
}
