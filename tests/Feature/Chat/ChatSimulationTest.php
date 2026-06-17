<?php

declare(strict_types=1);

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
    $dataList = $section['schema'][0]['schema'][0]['schema'][0]['schema'][1];
    $chatBox = $section['schema'][0]['schema'][1];

    expect($dataList['type'])->toBe('remote.data-list')
        ->and($dataList['props']['dataEndpoint'])->toBe('/workbench/remote/todos')
        ->and($dataList['props'])->not->toHaveKeys(['endpoint', 'tokenEndpoint', 'audience', 'scopes', 'resource', 'ref'])
        ->and($dataList['props']['remote']['source'])->toBe('workbench.todos')
        ->and($dataList['props']['remote']['audience'])->toBe('https://todos.workbench.test')
        ->and($dataList['props']['remote']['scopes'])->toBe(['todos.read'])
        ->and($dataList['props']['remote']['nodeId'])->toBe('todos')
        ->and($dataList['props']['remote']['nodeType'])->toBe('remote.data-list')
        ->and($dataList['props']['remote']['tokenEndpoint'])->toBe('/lattice/remote-sources/workbench.todos/token')
        ->and($dataList['props']['remote']['ref'])->toBeString()->not->toBe('')
        ->and($dataList['schema'][0]['type'])->toBe('card')
        ->and($dataList['schema'][0]['props']['dataBindings'])->toBe([
            'title' => 'title',
            'description' => 'detail',
        ])
        ->and($dataList['schema'][0]['schema'][0]['schema'][1]['type'])->toBe('button')
        ->and($dataList['schema'][0]['schema'][0]['schema'][1]['props']['dataBindings'])->toBe([
            'label' => 'actionLabel',
            'href' => 'actionHref',
        ]);

    expect($chatBox['type'])->toBe('chat.box')
        ->and($chatBox['props']['streamEndpoint'])->toBe('/workbench/remote/chat/stream')
        ->and($chatBox['props']['historyEndpoint'])->toBe('/workbench/remote/chat/history')
        ->and($chatBox['props'])->not->toHaveKeys(['endpoint', 'tokenEndpoint', 'audience', 'scopes', 'resource', 'ref'])
        ->and($chatBox['props']['remote']['source'])->toBe('workbench.todos')
        ->and($chatBox['props']['remote']['audience'])->toBe('https://todos.workbench.test')
        ->and($chatBox['props']['remote']['scopes'])->toBe(['chat.read', 'chat.write'])
        ->and($chatBox['props']['remote']['nodeId'])->toBe('workbench-todo-chat')
        ->and($chatBox['props']['remote']['nodeType'])->toBe('chat.box')
        ->and($chatBox['props']['remote']['tokenEndpoint'])->toBe('/lattice/remote-sources/workbench.todos/token')
        ->and($chatBox['props']['remote']['ref'])->toBeString()->not->toBe('')
        ->and($chatBox['props']['fill'])->toBeTrue();

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

    $response = get('/')->assertOk();

    $this->assertLatticeLayout($response)
        ->component('floating-panel', 'assistant-chat', fn ($panel) => $panel
            ->assertRendered('badge')
            ->component('chat.box', tap: fn ($box) => $box
                ->assertProp('streamEndpoint', '/workbench/chat/stream')
                ->assertProp('historyEndpoint', '/workbench/chat/history')));
});
