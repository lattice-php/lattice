<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Components\Card;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Remote\Components\DataList;
use Lattice\Lattice\Remote\Components\RemoteChatBox;

test('data list component serializes remote access with a signed ref', function (): void {
    $node = wire(
        DataList::make('customers')
            ->source('fixtures.crm')
            ->dataEndpoint('/workbench/remote/customers')
            ->emptyLabel('No customers')
            ->audience('https://crm.example.test')
            ->scopes(['customers.read']),
    );

    expect($node['props']['remote']['ref'])->toBeString()->not->toBe('');
    unset($node['props']['remote']['ref']);

    expect($node)
        ->toMatchArray([
            'type' => 'remote.data-list',
            'id' => 'customers',
            'props' => [
                'dataEndpoint' => '/workbench/remote/customers',
                'emptyLabel' => 'No customers',
                'remote' => [
                    'source' => 'fixtures.crm',
                    'audience' => 'https://crm.example.test',
                    'scopes' => ['customers.read'],
                    'nodeId' => 'customers',
                    'nodeType' => 'remote.data-list',
                    'tokenEndpoint' => '/lattice/remote-sources/fixtures.crm/token',
                ],
            ],
        ]);

    expect($node['props'])->not->toHaveKeys(['endpoint', 'tokenEndpoint', 'resource', 'ref']);
});

test('data list component serializes a row schema with component data bindings', function (): void {
    $node = wire(
        DataList::make('customers')
            ->source('fixtures.crm')
            ->dataEndpoint('/workbench/remote/customers')
            ->audience('https://crm.example.test')
            ->scopes(['customers.read'])
            ->schema([
                Card::make()
                    ->dataKey('title', 'name')
                    ->schema([
                        Text::make('')
                            ->dataKey('text', 'email'),
                    ]),
            ]),
    );

    expect($node['schema'][0]['type'])->toBe('card')
        ->and($node['schema'][0]['props']['dataBindings'])->toBe(['title' => 'name'])
        ->and($node['schema'][0]['schema'][0]['type'])->toBe('text')
        ->and($node['schema'][0]['schema'][0]['props']['dataBindings'])->toBe(['text' => 'email']);
});

test('component data bindings can be replaced in one call', function (): void {
    $node = wire(
        Card::make()
            ->dataBindings([
                'title' => 'name',
                'description' => 'email',
            ]),
    );

    expect($node['props']['dataBindings'])->toBe([
        'title' => 'name',
        'description' => 'email',
    ]);
});

test('remote chat box component serializes remote access with a signed ref', function (): void {
    $node = wire(
        RemoteChatBox::make('crm-chat')
            ->source('fixtures.crm')
            ->audience('https://crm.example.test')
            ->scopes(['chat.read', 'chat.write'])
            ->streamEndpoint('/workbench/remote/chat/stream')
            ->historyEndpoint('/workbench/remote/chat/history')
            ->conversationId('conversation-1')
            ->placeholder('Ask CRM')
            ->title('CRM assistant')
            ->fill(),
    );

    expect($node['props']['remote']['ref'])->toBeString()->not->toBe('');
    unset($node['props']['remote']['ref']);

    expect($node)
        ->toMatchArray([
            'type' => 'remote.chat-box',
            'id' => 'crm-chat',
            'props' => [
                'streamEndpoint' => '/workbench/remote/chat/stream',
                'historyEndpoint' => '/workbench/remote/chat/history',
                'conversationId' => 'conversation-1',
                'placeholder' => 'Ask CRM',
                'title' => 'CRM assistant',
                'fill' => true,
                'remote' => [
                    'source' => 'fixtures.crm',
                    'audience' => 'https://crm.example.test',
                    'scopes' => ['chat.read', 'chat.write'],
                    'nodeId' => 'crm-chat',
                    'nodeType' => 'remote.chat-box',
                    'tokenEndpoint' => '/lattice/remote-sources/fixtures.crm/token',
                ],
            ],
        ]);
});

test('remote components require source and audience before remote access is serialized', function (): void {
    expect(fn () => wire(
        DataList::make('customers')
            ->source('fixtures.crm'),
    ))->toThrow(LogicException::class, 'must define source() and audience()');
});

test('remote components require an id before remote access is serialized', function (): void {
    expect(fn () => wire(
        (new RemoteChatBox)
            ->source('fixtures.crm')
            ->audience('https://crm.example.test'),
    ))->toThrow(LogicException::class, 'must be given an id()');
});
