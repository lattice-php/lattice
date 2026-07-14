<?php
declare(strict_types=1);

use function Pest\Laravel\get;
use function Pest\Laravel\getJson;
use function Pest\Laravel\withoutVite;

test('workbench remote schema page renders the remote todo list beside a full remote chat box', function (): void {
    withoutVite();
    $this->actingAs(workbenchTestUser());

    $this->assertLatticePage(get('/platform/remote-schema')->assertOk())
        ->assertRendered('section')
        ->component('grid', tap: fn ($grid) => $grid->assertProp('columns', 2))
        ->component('remote.data-list', tap: fn ($list) => $list
            ->assertProp('dataEndpoint', '/workbench/remote/todos')
            ->component('card', tap: fn ($card) => $card
                ->assertProp('dataBindings.title', 'title')
                ->component('button', tap: fn ($button) => $button
                    ->assertProp('dataBindings.href', 'actionHref'))))
        ->component('chat.box', tap: fn ($chat) => $chat->assertProp('fill', true));
});

test('workbench remote todos endpoint returns five todo rows', function (): void {
    $this->actingAs(workbenchTestUser());

    $response = getJson('/workbench/remote/todos', [
        'Authorization' => 'Bearer fake-workbench-todos-token',
    ])->assertOk();

    $response->assertJsonCount(5, 'data');

    expect($response->json('data.0'))->toHaveKeys([
        'id',
        'title',
        'detail',
        'status',
        'actionLabel',
        'actionHref',
    ]);
});
