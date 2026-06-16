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

    expect($partFrames)->toHaveCount(2)
        ->and($partFrames[0]['part']['type'])->toBe('chat.part.tool-call')
        ->and($partFrames[0]['part']['props']['name'])->toBe('lookup')
        ->and($partFrames[1]['part']['type'])->toBe('section');

    $section = $partFrames[1]['part'];
    $dataList = $section['schema'][0]['schema'][1];
    $chatBox = $section['schema'][0]['schema'][2];

    expect($dataList['type'])->toBe('remote.data-list')
        ->and($dataList['props']['dataEndpoint'])->toBe('/workbench/remote/customers')
        ->and($dataList['props'])->not->toHaveKeys(['endpoint', 'tokenEndpoint', 'audience', 'scopes', 'resource', 'ref'])
        ->and($dataList['props']['remote']['source'])->toBe('workbench.crm')
        ->and($dataList['props']['remote']['audience'])->toBe('https://crm.workbench.test')
        ->and($dataList['props']['remote']['scopes'])->toBe(['customers.read'])
        ->and($dataList['props']['remote']['nodeId'])->toBe('customers')
        ->and($dataList['props']['remote']['nodeType'])->toBe('remote.data-list')
        ->and($dataList['props']['remote']['ref'])->toBeString()->not->toBe('');

    expect($chatBox['type'])->toBe('remote.chat-box')
        ->and($chatBox['props']['streamEndpoint'])->toBe('/workbench/remote/chat/stream')
        ->and($chatBox['props']['historyEndpoint'])->toBe('/workbench/remote/chat/history')
        ->and($chatBox['props'])->not->toHaveKeys(['endpoint', 'tokenEndpoint', 'audience', 'scopes', 'resource', 'ref'])
        ->and($chatBox['props']['remote']['source'])->toBe('workbench.crm')
        ->and($chatBox['props']['remote']['audience'])->toBe('https://crm.workbench.test')
        ->and($chatBox['props']['remote']['scopes'])->toBe(['chat.read', 'chat.write'])
        ->and($chatBox['props']['remote']['nodeId'])->toBe('workbench-crm-chat')
        ->and($chatBox['props']['remote']['nodeType'])->toBe('remote.chat-box')
        ->and($chatBox['props']['remote']['ref'])->toBeString()->not->toBe('');

    $messages = app(FakeConversationStore::class)->messages();
    $roles = array_column($messages, 'role');

    expect($roles)->toContain('user')->toContain('assistant');

    $assistant = array_values(array_filter($messages, static fn (array $message): bool => $message['role'] === 'assistant'));
    $latestAssistant = end($assistant);
    $partTypes = array_column($latestAssistant['parts'], 'type');

    expect($partTypes)->toContain('chat.part.text')
        ->toContain('chat.part.tool-call')
        ->toContain('section');
});

test('the floating chat box is mounted in the layout', function (): void {
    withoutVite();
    $this->actingAs(workbenchTestUser());

    get('/')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('lattice/page')
            ->where('lattice.layout.schema.3.type', 'floating-panel')
            ->where('lattice.layout.schema.3.props.trigger.0.type', 'badge')
            ->where('lattice.layout.schema.3.schema.0.type', 'chat.box')
            ->where('lattice.layout.schema.3.schema.0.props.streamEndpoint', '/workbench/chat/stream')
            ->where('lattice.layout.schema.3.schema.0.props.historyEndpoint', '/workbench/chat/history')
            ->etc()
        );
});
