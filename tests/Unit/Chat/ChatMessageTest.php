<?php

declare(strict_types=1);

use Lattice\Lattice\Chat\ChatMessage;
use Lattice\Lattice\Chat\ChatPart;
use Lattice\Lattice\Chat\Enums\ChatRole;

test('a chat message serializes id, role value, and flattened parts', function (): void {
    $message = new ChatMessage('m-1', ChatRole::Assistant, [
        ChatPart::text('Searching'),
        ChatPart::toolCall('lookup', ['q' => 'x']),
    ]);

    expect($message->jsonSerialize())->toBe([
        'id' => 'm-1',
        'role' => 'assistant',
        'parts' => [
            ['type' => 'text', 'text' => 'Searching'],
            ['type' => 'tool-call', 'name' => 'lookup', 'args' => ['q' => 'x']],
        ],
    ]);
});

test('chat roles expose their wire values', function (): void {
    expect(ChatRole::User->value)->toBe('user')
        ->and(ChatRole::Assistant->value)->toBe('assistant')
        ->and(ChatRole::System->value)->toBe('system');
});
