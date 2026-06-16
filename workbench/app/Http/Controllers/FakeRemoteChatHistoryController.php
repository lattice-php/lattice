<?php
declare(strict_types=1);

namespace Workbench\App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Lattice\Lattice\Chat\ChatMessage;
use Lattice\Lattice\Chat\ChatPart;
use Lattice\Lattice\Chat\Enums\ChatRole;

final readonly class FakeRemoteChatHistoryController
{
    public function __invoke(Request $request): JsonResponse
    {
        abort_unless($request->bearerToken() === 'fake-workbench-todos-token', 403);

        return response()->json([
            'messages' => [
                (new ChatMessage('remote-assistant-1', ChatRole::Assistant, [
                    ChatPart::text('Remote todo history loaded with a browser token.'),
                ]))->jsonSerialize(),
            ],
        ]);
    }
}
