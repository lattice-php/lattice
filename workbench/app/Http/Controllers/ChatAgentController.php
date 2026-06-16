<?php

declare(strict_types=1);

namespace Workbench\App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Lattice\Lattice\Chat\ChatMessage;
use Lattice\Lattice\Chat\ChatPart;
use Lattice\Lattice\Chat\Enums\ChatRole;
use Lattice\Lattice\Remote\RemoteSourceRegistry;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Workbench\App\Chat\FakeConversationStore;

final readonly class ChatAgentController
{
    private const string REPLY = 'Sure, let me look that up for you right away.';

    public function __construct(
        private FakeConversationStore $store,
        private RemoteSourceRegistry $remoteSources,
    ) {}

    public function __invoke(Request $request): StreamedResponse
    {
        $message = trim((string) $request->input('message'));

        $this->store->append(
            (new ChatMessage((string) Str::uuid(), ChatRole::User, [
                ChatPart::text($message),
            ]))->jsonSerialize(),
        );

        return response()->stream(function () use ($message, $request): void {
            $words = explode(' ', self::REPLY);

            foreach ($words as $word) {
                $this->writeFrame(['type' => 'text', 'value' => $word.' ']);

                if (! app()->runningUnitTests()) {
                    usleep(80000);
                }
            }

            $toolCall = ChatPart::toolCall('lookup', ['query' => $message]);
            $schema = $this->remoteSources->resolve('workbench.todos')->schema($request);

            $this->writeFrame(['type' => 'part', 'part' => $toolCall->jsonSerialize()]);
            foreach ($schema as $part) {
                $this->writeFrame(['type' => 'part', 'part' => $part->jsonSerialize()]);
            }

            $this->writeFrame(['type' => 'done']);

            $this->store->append(
                (new ChatMessage((string) Str::uuid(), ChatRole::Assistant, [
                    ChatPart::text(self::REPLY),
                    $toolCall,
                    ...$schema,
                ]))->jsonSerialize(),
            );
        }, 200, [
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    /**
     * @param  array<string, mixed>  $frame
     */
    private function writeFrame(array $frame): void
    {
        echo json_encode($frame, JSON_THROW_ON_ERROR)."\n";

        if (ob_get_level() > 0) {
            ob_flush();
        }

        flush();
    }
}
