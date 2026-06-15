<?php

declare(strict_types=1);

use Lattice\Lattice\Chat\Attributes\AsChatPart;
use Lattice\Lattice\Chat\ChatPart;
use Lattice\Lattice\Chat\ChatPartRegistry;
use Lattice\Lattice\Chat\Parts\TextPart;
use Lattice\Lattice\Chat\Parts\ToolCallPart;

#[AsChatPart('text')]
final readonly class ConflictingTextPart extends ChatPart {}

test('a text part serializes to a flat type-tagged shape', function (): void {
    expect(ChatPart::text('Hello')->jsonSerialize())
        ->toBe(['type' => 'text', 'text' => 'Hello']);
});

test('a tool-call part serializes its name and args', function (): void {
    expect(ChatPart::toolCall('lookup', ['q' => 'x'])->jsonSerialize())
        ->toBe(['type' => 'tool-call', 'name' => 'lookup', 'args' => ['q' => 'x']]);
});

test('factories return the concrete part value objects', function (): void {
    $text = ChatPart::text('hi');
    $toolCall = ChatPart::toolCall('lookup', []);

    expect($text::class)->toBe(TextPart::class)
        ->and($toolCall::class)->toBe(ToolCallPart::class);
});

test('the registry exposes built-in parts keyed by wire type', function (): void {
    expect(ChatPartRegistry::withBuiltins()->all())
        ->toBe([
            'text' => TextPart::class,
            'tool-call' => ToolCallPart::class,
        ]);
});

test('the registry rejects a class without the AsChatPart attribute', function (): void {
    $registry = new ChatPartRegistry;

    $registry->register(stdClass::class);
})->throws(InvalidArgumentException::class);

test('the registry rejects a different class claiming an already-used wire type', function (): void {
    $registry = new ChatPartRegistry;
    $registry->register(TextPart::class);

    $registry->register(ConflictingTextPart::class);
})->throws(InvalidArgumentException::class);

test('re-registering the same class is a silent no-op', function (): void {
    $registry = new ChatPartRegistry;
    $registry->register(TextPart::class);
    $registry->register(TextPart::class);

    expect($registry->all())->toBe(['text' => TextPart::class]);
});
