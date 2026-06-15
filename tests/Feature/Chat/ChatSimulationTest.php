<?php

declare(strict_types=1);

use Inertia\Testing\AssertableInertia;
use Workbench\App\Chat\FakeConversationStore;

use function Pest\Laravel\get;
use function Pest\Laravel\post;
use function Pest\Laravel\withoutVite;

test('history endpoint returns the seeded conversation messages', function (): void {
    $this->actingAs(workbenchTestUser());

    $response = get('/workbench/chat/history')->assertOk();

    $messages = $response->json('messages');

    expect($messages)->toBeArray()->not->toBeEmpty();

    foreach ($messages as $message) {
        expect($message)->toHaveKeys(['role', 'parts']);
    }

    $roles = array_column($messages, 'role');

    expect($roles)->toContain('user')->toContain('assistant');
});

test('stream endpoint emits NDJSON text and tool-call frames then persists the turn', function (): void {
    $this->actingAs(workbenchTestUser());

    $content = post('/workbench/chat/stream', ['message' => 'hi'])->streamedContent();

    $frames = array_values(array_filter(array_map(
        static fn (string $line): ?array => $line === '' ? null : json_decode($line, true),
        explode("\n", $content),
    )));

    $types = array_column($frames, 'type');

    expect($types)->toContain('text')->toContain('part')->toContain('done');

    $partFrames = array_values(array_filter($frames, static fn (array $frame): bool => $frame['type'] === 'part'));

    expect($partFrames)->toHaveCount(1)
        ->and($partFrames[0]['part']['type'])->toBe('tool-call')
        ->and($partFrames[0]['part']['name'])->toBe('lookup');

    $messages = app(FakeConversationStore::class)->messages();
    $roles = array_column($messages, 'role');

    expect($roles)->toContain('user')->toContain('assistant');

    $assistant = array_values(array_filter($messages, static fn (array $message): bool => $message['role'] === 'assistant'));
    $latestAssistant = end($assistant);
    $partTypes = array_column($latestAssistant['parts'], 'type');

    expect($partTypes)->toContain('text')->toContain('tool-call');
});

test('the floating chat window is mounted in the layout', function (): void {
    withoutVite();
    $this->actingAs(workbenchTestUser());

    get('/')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('lattice/page')
            ->where('lattice.layout.schema.2.type', 'floating-panel')
            ->where('lattice.layout.schema.2.schema.0.type', 'chat.window')
            ->where('lattice.layout.schema.2.schema.0.props.streamEndpoint', '/workbench/chat/stream')
            ->where('lattice.layout.schema.2.schema.0.props.historyEndpoint', '/workbench/chat/history')
            ->etc()
        );
});
