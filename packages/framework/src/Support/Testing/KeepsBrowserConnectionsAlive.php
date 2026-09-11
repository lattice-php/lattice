<?php

declare(strict_types=1);

namespace Lattice\Support\Testing;

use Amp\Http\Server\DefaultErrorHandler;
use Amp\Http\Server\Driver\DefaultHttpDriverFactory;
use Amp\Http\Server\Request as ServerRequest;
use Amp\Http\Server\RequestHandler\ClosureRequestHandler;
use Amp\Http\Server\Response as ServerResponse;
use Amp\Http\Server\SocketHttpServer;
use Pest\Browser\Drivers\LaravelHttpServer;
use Pest\Browser\ServerManager;
use Psr\Log\NullLogger;
use ReflectionMethod;
use ReflectionProperty;

/**
 * Starts pest-plugin-browser's HTTP server with an hour-long keep-alive
 * before the plugin can start it with amphp's 15-second default. Use it on a
 * browser test case; the test case runs setUpKeepsBrowserConnectionsAlive()
 * by the trait-name convention.
 *
 * Chrome pools connections for minutes and ignores the server's
 * `Keep-Alive: timeout` hint, so with the default it regularly sends a
 * request on a connection the server is concurrently closing. The request
 * then dies at the network level: dynamic imports fail with "Failed to fetch
 * dynamically imported module" and Inertia submits vanish without an error,
 * typically once DOM-polling assertions have left a connection idle past
 * 15 seconds. The plugin exposes no server configuration, so this pre-starts
 * the identical server with a longer timeout; LaravelHttpServer::start() then
 * finds the socket already present and leaves it in place.
 */
trait KeepsBrowserConnectionsAlive
{
    protected function setUpKeepsBrowserConnectionsAlive(): void
    {
        $http = ServerManager::instance()->http();

        if (! $http instanceof LaravelHttpServer) {
            return;
        }

        $socketProperty = new ReflectionProperty(LaravelHttpServer::class, 'socket');

        if ($socketProperty->getValue($http) !== null) {
            return;
        }

        $logger = new NullLogger;
        $keepAliveSeconds = 3600;

        $server = SocketHttpServer::createForDirectAccess(
            $logger,
            httpDriverFactory: new DefaultHttpDriverFactory(
                $logger,
                streamTimeout: $keepAliveSeconds,
                connectionTimeout: $keepAliveSeconds,
            ),
        );

        $server->expose("{$http->host}:{$http->port}");

        $handleRequest = new ReflectionMethod(LaravelHttpServer::class, 'handleRequest');

        $server->start(
            new ClosureRequestHandler(function (ServerRequest $request) use ($handleRequest, $http): ServerResponse {
                $response = $handleRequest->invoke($http, $request);

                assert($response instanceof ServerResponse);

                return $response;
            }),
            new DefaultErrorHandler,
        );

        $socketProperty->setValue($http, $server);
    }
}
