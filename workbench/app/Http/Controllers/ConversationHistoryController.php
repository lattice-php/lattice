<?php

declare(strict_types=1);

namespace Workbench\App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Workbench\App\Chat\FakeConversationStore;

final readonly class ConversationHistoryController
{
    public function __construct(private FakeConversationStore $store) {}

    public function __invoke(): JsonResponse
    {
        return response()->json([
            'messages' => $this->store->messages(),
        ]);
    }
}
