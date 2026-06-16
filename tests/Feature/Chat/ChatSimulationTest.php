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
        ->and($partFrames[1]['part']['type'])->toBe('integration.browser-data');

    $browserData = $partFrames[1]['part'];

    expect($browserData['props']['endpoint'])->toBe('/lattice/integrations/workbench.crm/token')
        ->and($browserData['props']['tokenEndpoint'])->toBe('/lattice/integrations/workbench.crm/token')
        ->and($browserData['props']['dataEndpoint'])->toBe('/workbench/external/customers')
        ->and($browserData['props']['audience'])->toBe('https://crm.workbench.test')
        ->and($browserData['props']['scopes'])->toBe(['customers.read'])
        ->and($browserData['props']['resource'])->toBe('workbench-crm-customers')
        ->and($browserData['props']['ref'])->toBeString()->not->toBe('');

    $messages = app(FakeConversationStore::class)->messages();
    $roles = array_column($messages, 'role');

    expect($roles)->toContain('user')->toContain('assistant');

    $assistant = array_values(array_filter($messages, static fn (array $message): bool => $message['role'] === 'assistant'));
    $latestAssistant = end($assistant);
    $partTypes = array_column($latestAssistant['parts'], 'type');

    expect($partTypes)->toContain('chat.part.text')
        ->toContain('chat.part.tool-call')
        ->toContain('integration.browser-data');
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
