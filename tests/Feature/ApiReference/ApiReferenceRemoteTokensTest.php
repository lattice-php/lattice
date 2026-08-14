<?php

declare(strict_types=1);

use Lattice\ApiReference\ApiReference;
use Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Core\Remote\RemoteAccess;

/**
 * @param  array<string, array<string, mixed>>  $paths
 * @param  list<array<string, list<string>>>  $security
 * @return array<string, mixed>
 */
function specWithOperations(array $paths, array $security = []): array
{
    return [
        'openapi' => '3.1.0',
        'security' => $security,
        'paths' => $paths,
        'components' => [
            'securitySchemes' => [
                'oauth2' => ['type' => 'oauth2', 'flows' => []],
                'apiKey' => ['type' => 'apiKey', 'in' => 'header', 'name' => 'X-Key'],
            ],
        ],
    ];
}

it('seals one remote token access per distinct operation scope set', function (): void {
    $spec = specWithOperations([
        '/widgets' => [
            'get' => ['security' => [['oauth2' => ['catalog:view']]]],
            'post' => ['security' => [['oauth2' => ['catalog:manage', 'catalog:view']]]],
        ],
        '/orders' => [
            'get' => ['security' => [['oauth2' => ['catalog:view']]]],
        ],
    ]);

    $props = ApiReference::make()
        ->id('api-docs')
        ->spec($spec)
        ->tokenSource('api-docs-tokens', audience: 'acme')
        ->jsonSerialize()['props'];

    $remoteTokens = $props['remoteTokens'];

    expect($remoteTokens)->toHaveCount(2)
        ->and($remoteTokens[0])->toBeInstanceOf(RemoteAccess::class)
        ->and($remoteTokens[0]->scopes)->toBe(['catalog:view'])
        ->and($remoteTokens[1]->scopes)->toBe(['catalog:manage', 'catalog:view'])
        ->and($remoteTokens[0]->source)->toBe('api-docs-tokens')
        ->and($remoteTokens[0]->audience)->toBe('acme')
        ->and($remoteTokens[0]->nodeId)->toBe('api-docs')
        ->and($remoteTokens[0]->nodeType)->toBe('api-reference')
        ->and($remoteTokens[0]->tokenEndpoint)->toContain('api-docs-tokens');

    $context = app(SignsComponentReferences::class)
        ->unseal($remoteTokens[0]->ref, 'api-reference', 'api-docs');

    expect($context)->toMatchArray([
        'audience' => 'acme',
        'source' => 'api-docs-tokens',
        'scopes' => ['catalog:view'],
    ]);
});

it('falls back to the document security and skips non-bearer operations', function (): void {
    $spec = specWithOperations([
        '/widgets' => [
            'get' => [],
            'delete' => ['security' => [['apiKey' => []]]],
            'parameters' => [['name' => 'x', 'in' => 'query']],
        ],
    ], security: [['oauth2' => ['catalog:view']]]);

    $remoteTokens = ApiReference::make()
        ->id('api-docs')
        ->spec($spec)
        ->tokenSource('api-docs-tokens', audience: 'acme')
        ->jsonSerialize()['props']['remoteTokens'];

    expect($remoteTokens)->toHaveCount(1)
        ->and($remoteTokens[0]->scopes)->toBe(['catalog:view']);
});

it('keeps remoteTokens null without a token source', function (): void {
    $props = ApiReference::make()->spec(['openapi' => '3.1.0'])->jsonSerialize()['props'];

    expect($props['remoteTokens'])->toBeNull();
});

it('requires an inline spec for a token source', function (): void {
    ApiReference::make()->id('api-docs')->url('/openapi.json')
        ->tokenSource('api-docs-tokens', audience: 'acme')
        ->jsonSerialize();
})->throws(LogicException::class, 'inline spec()');

it('requires an id for a token source', function (): void {
    ApiReference::make()->spec(['openapi' => '3.1.0'])
        ->tokenSource('api-docs-tokens', audience: 'acme')
        ->jsonSerialize();
})->throws(LogicException::class, 'id()');
