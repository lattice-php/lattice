<?php
declare(strict_types=1);

use Lattice\ApiReference\ApiReference;
use Lattice\Core\Enums\Breakpoint;

it('serializes the api-reference node', function (): void {
    $node = ApiReference::make()->url('/openapi.json')->jsonSerialize();

    expect($node['type'])->toBe('api-reference')
        ->and($node['props']['url'])->toBe('/openapi.json');
});

it('defaults to the grouped API reference', function (): void {
    $props = ApiReference::make()->jsonSerialize()['props'];

    expect($props)->toMatchArray([
        'operation' => null,
        'tags' => null,
        'defaultOperation' => null,
        'hideHeader' => false,
        'hideBaseUrl' => false,
        'title' => null,
        'expandDepth' => 2,
        'twoColumnBreakpoint' => 'lg',
        'token' => null,
    ]);
});

it('serializes fluent options', function (Closure $configure, string $property, mixed $expected): void {
    $props = $configure(ApiReference::make())->jsonSerialize()['props'];

    expect($props[$property])->toBe($expected);
})->with([
    'inline spec' => [fn (ApiReference $reference): ApiReference => $reference->spec(['openapi' => '3.0.0']), 'spec', ['openapi' => '3.0.0']],
    'token' => [fn (ApiReference $reference): ApiReference => $reference->token('secret-token'), 'token', 'secret-token'],
    'operation' => [fn (ApiReference $reference): ApiReference => $reference->operation('get-users-id'), 'operation', 'get-users-id'],
    'default operation' => [fn (ApiReference $reference): ApiReference => $reference->defaultOperation('get-users-id'), 'defaultOperation', 'get-users-id'],
    'hidden header' => [fn (ApiReference $reference): ApiReference => $reference->hideHeader(), 'hideHeader', true],
    'hidden base URL' => [fn (ApiReference $reference): ApiReference => $reference->hideBaseUrl(), 'hideBaseUrl', true],
    'title' => [fn (ApiReference $reference): ApiReference => $reference->title('My API'), 'title', 'My API'],
    'expand depth' => [fn (ApiReference $reference): ApiReference => $reference->expandDepth(2), 'expandDepth', 2],
    'two column breakpoint' => [fn (ApiReference $reference): ApiReference => $reference->twoColumnBreakpoint(Breakpoint::Xl), 'twoColumnBreakpoint', 'xl'],
]);

it('normalizes tag input', function (string|array $tags, array $expected): void {
    expect(ApiReference::make()->tag($tags)->jsonSerialize()['props']['tags'])->toBe($expected);
})->with([
    'single tag' => ['Users', ['Users']],
    'tag list' => [['A', 'B'], ['A', 'B']],
]);
