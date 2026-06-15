<?php

declare(strict_types=1);

use Lattice\Lattice\Chat\ChatPart;
use Lattice\Lattice\Chat\Components\TextPart;
use Lattice\Lattice\Chat\Components\ToolCallPart;

test('a text part serializes to a type-tagged node with props', function (): void {
    expect(ChatPart::text('Hello')->jsonSerialize())
        ->toBe(['type' => 'chat.part.text', 'props' => ['text' => 'Hello']]);
});

test('a tool-call part serializes its name and args into props', function (): void {
    expect(ChatPart::toolCall('lookup', ['q' => 'x'])->jsonSerialize())
        ->toBe(['type' => 'chat.part.tool-call', 'props' => ['name' => 'lookup', 'args' => ['q' => 'x']]]);
});

test('factories return the concrete part components', function (): void {
    $text = ChatPart::text('hi');
    $toolCall = ChatPart::toolCall('lookup', []);

    expect($text::class)->toBe(TextPart::class)
        ->and($toolCall::class)->toBe(ToolCallPart::class);
});
