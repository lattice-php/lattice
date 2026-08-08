<?php

declare(strict_types=1);

namespace Workbench\App\Chat;

use Illuminate\Contracts\Session\Session;
use Lattice\Chat\ChatMessage;
use Lattice\Chat\ChatPart;
use Lattice\Chat\Enums\ChatRole;
use Lattice\Core\Support\Wire;

final readonly class FakeConversationStore
{
    private const string SESSION_KEY = 'workbench.chat.conversation';

    public function __construct(private Session $session) {}

    /**
     * @return array<int, array{id: string, role: string, parts: array<int, array<string, mixed>>}>
     */
    public function messages(): array
    {
        if (! $this->session->has(self::SESSION_KEY)) {
            $this->session->put(self::SESSION_KEY, $this->seed());
        }

        return $this->session->get(self::SESSION_KEY, []);
    }

    public function append(ChatMessage $message): void
    {
        $messages = $this->messages();
        $messages[] = $this->toShape($message);

        $this->session->put(self::SESSION_KEY, $messages);
    }

    public function reset(): void
    {
        $this->session->forget(self::SESSION_KEY);
    }

    /**
     * @return array<int, array{id: string, role: string, parts: array<int, array<string, mixed>>}>
     */
    private function seed(): array
    {
        return [
            $this->toShape(new ChatMessage('seed-user', ChatRole::User, [
                ChatPart::text('What can you help me with?'),
            ])),
            $this->toShape(new ChatMessage('seed-assistant', ChatRole::Assistant, [
                ChatPart::text('I can answer questions about this workbench and look things up for you.'),
            ])),
        ];
    }

    /**
     * @return array{id: string, role: string, parts: array<int, array<string, mixed>>}
     */
    private function toShape(ChatMessage $message): array
    {
        return [
            'id' => $message->id,
            'role' => $message->role->value,
            'parts' => array_map(Wire::toArray(...), $message->parts),
        ];
    }
}
