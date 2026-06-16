<?php

declare(strict_types=1);

namespace Workbench\App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Lattice\Lattice\Chat\ChatMessage;
use Lattice\Lattice\Chat\ChatPart;
use Lattice\Lattice\Chat\Enums\ChatRole;
use Lattice\Lattice\Integrations\Components\BrowserData;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Workbench\App\Chat\FakeConversationStore;

final readonly class ChatAgentController
{
    private const string REPLY = 'Sure, let me look that up for you right away.';

    public function __construct(private FakeConversationStore $store) {}

    public function __invoke(Request $request): StreamedResponse
    {
        $message = trim((string) $request->input('message'));

        $this->store->append(
            (new ChatMessage((string) Str::uuid(), ChatRole::User, [
                ChatPart::text($message),
            ]))->jsonSerialize(),
        );

        return response()->stream(function () use ($message): void {
            $words = explode(' ', self::REPLY);

            foreach ($words as $word) {
                $this->writeFrame(['type' => 'text', 'value' => $word.' ']);

                if (! app()->runningUnitTests()) {
                    usleep(80000);
                }
            }

            $toolCall = ChatPart::toolCall('lookup', ['query' => $message]);
            $browserData = BrowserData::make('customers')
                ->integration('workbench.crm')
                ->tokenEndpoint('/lattice/integrations/workbench.crm/token')
                ->dataEndpoint('/workbench/external/customers')
                ->audience('https://crm.workbench.test')
                ->scopes(['customers.read'])
                ->resource('customers');

            $this->writeFrame(['type' => 'part', 'part' => $toolCall->jsonSerialize()]);
            $this->writeFrame(['type' => 'part', 'part' => $browserData->jsonSerialize()]);
            $this->writeFrame(['type' => 'done']);

            $this->store->append(
                (new ChatMessage((string) Str::uuid(), ChatRole::Assistant, [
                    ChatPart::text(self::REPLY),
                    $toolCall,
                    $browserData,
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
