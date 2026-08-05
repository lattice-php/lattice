<?php

declare(strict_types=1);

use Lattice\Tests\Browser\Support\ReverbServer;
use Workbench\App\Events\OrderShipped;

function bootReverb(): void
{
    static $reverb = null;

    $reverb ??= ReverbServer::boot();

    config([
        'broadcasting.default' => 'reverb',
        'broadcasting.connections.reverb' => [
            'driver' => 'reverb',
            'key' => $reverb->appKey(),
            'secret' => $reverb->appSecret(),
            'app_id' => $reverb->appId(),
            'options' => [
                'host' => $reverb->host(),
                'port' => $reverb->port(),
                'scheme' => 'http',
                'useTLS' => false,
            ],
        ],
        'reverb.apps.apps' => [[
            'key' => $reverb->appKey(),
            'secret' => $reverb->appSecret(),
            'app_id' => $reverb->appId(),
            'options' => [
                'host' => $reverb->host(),
                'port' => $reverb->port(),
                'scheme' => 'http',
            ],
            'allowed_origins' => ['*'],
        ]],
        'workbench.reverb' => [
            'host' => $reverb->host(),
            'port' => $reverb->port(),
            'key' => $reverb->appKey(),
            'scheme' => 'http',
        ],
    ]);
}

it('delivers a broadcast to the browser and shows a toast', function (): void {
    $this->actingAs(workbenchTestUser());
    bootReverb();

    $page = visit('/platform/realtime');

    retryUntil(
        function () use ($page): void {
            expect($page->text('[data-test="echo-status"]'))->toBe('connected');
        },
        attempts: 50,
        sleepMicroseconds: 200_000,
    );

    retryUntil(
        function () use ($page): void {
            $page->assertSee('Order shipped');
        },
        attempts: 20,
        sleepMicroseconds: 300_000,
        between: function (): void {
            OrderShipped::dispatch(7);
        },
    );

    $page->assertNoJavaScriptErrors();
});
