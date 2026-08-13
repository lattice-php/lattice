<?php
declare(strict_types=1);

namespace Lattice\Core\Wire;

final class RemoteManifestRules
{
    /**
     * @var array<string, list<string>>
     */
    public const array EXTERNAL_URL_PROPS = [
        'remote.data-list' => ['dataEndpoint'],
        'chat.box' => ['streamEndpoint', 'historyEndpoint'],
    ];

    /**
     * Server-trusted prop keys a remote manifest may never supply; the wire
     * schema publishes the same list in the RemoteManifestNode contract.
     *
     * @var list<string>
     */
    public const array FORBIDDEN_PROP_KEYS = ['action', 'endpoint', 'ref', 'remote', 'tokenEndpoint'];
}
