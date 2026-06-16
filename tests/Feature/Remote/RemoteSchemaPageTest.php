<?php
declare(strict_types=1);

use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\get;
use function Pest\Laravel\getJson;
use function Pest\Laravel\withoutVite;

test('workbench remote schema page renders the remote todo list beside a full remote chat box', function (): void {
    withoutVite();
    $this->actingAs(workbenchTestUser());

    get('/workbench/remote-schema')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('lattice.schema.0.type', 'section')
            ->where('lattice.schema.0.schema.0.type', 'grid')
            ->where('lattice.schema.0.schema.0.props.columns', 2)
            ->where('lattice.schema.0.schema.0.schema.0.type', 'stack')
            ->where('lattice.schema.0.schema.0.schema.0.schema.0.type', 'card')
            ->where('lattice.schema.0.schema.0.schema.0.schema.0.schema.1.type', 'remote.data-list')
            ->where('lattice.schema.0.schema.0.schema.0.schema.0.schema.1.props.dataEndpoint', '/workbench/remote/todos')
            ->where('lattice.schema.0.schema.0.schema.0.schema.0.schema.1.schema.0.type', 'card')
            ->where('lattice.schema.0.schema.0.schema.0.schema.0.schema.1.schema.0.props.dataBindings.title', 'title')
            ->where('lattice.schema.0.schema.0.schema.0.schema.0.schema.1.schema.0.schema.0.schema.1.type', 'button')
            ->where('lattice.schema.0.schema.0.schema.0.schema.0.schema.1.schema.0.schema.0.schema.1.props.dataBindings.href', 'actionHref')
            ->where('lattice.schema.0.schema.0.schema.1.type', 'remote.chat-box')
            ->where('lattice.schema.0.schema.0.schema.1.props.fill', true)
        );
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
