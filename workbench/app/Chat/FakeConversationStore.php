<?php

declare(strict_types=1);

namespace Workbench\App\Chat;

use Illuminate\Contracts\Session\Session;
use Lattice\Lattice\Chat\ChatMessage;
use Lattice\Lattice\Chat\ChatPart;
use Lattice\Lattice\Chat\Enums\ChatRole;

final class FakeConversationStore
{
    private const SESSION_KEY = 'workbench.chat.conversation';

    public function __construct(private readonly Session $session) {}

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

    /**
     * @param  array{id: string, role: string, parts: array<int, array<string, mixed>>}  $message
     */
    public function append(array $message): void
    {
        $messages = $this->messages();
        $messages[] = $message;

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
            (new ChatMessage('seed-user', ChatRole::User, [
                ChatPart::text('What can you help me with?'),
            ]))->jsonSerialize(),
            (new ChatMessage('seed-assistant', ChatRole::Assistant, [
                ChatPart::text('I can answer questions about this workbench and look things up for you.'),
            ]))->jsonSerialize(),
        ];
    }
}
