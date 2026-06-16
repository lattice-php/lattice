<?php
declare(strict_types=1);

namespace Lattice\Lattice\Integrations;

use Illuminate\Filesystem\Filesystem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use JsonException;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Contracts\SignsComponentReferences;

final readonly class RemoteSchemaResolver
{
    /**
     * @var array<string, list<string>>
     */
    private const array EXTERNAL_URL_PROPS = [
        'remote.data-list' => ['dataEndpoint'],
        'remote.external-chat-box' => ['streamEndpoint', 'historyEndpoint'],
    ];

    public function __construct(
        private ExternalSchemaNormalizer $normalizer,
        private IntegrationRegistry $integrations,
        private Filesystem $files,
        private SignsComponentReferences $references,
    ) {}

    /**
     * @return list<Component>
     */
    public function resolve(IntegrationDefinition $definition, ExternalSchemaEndpoint $endpoint, Request $request): array
    {
        $integration = $this->integrations->keyForDefinition($definition::class);
        $manifest = $this->manifest($this->load($endpoint, $request));

        return $this->normalizer->normalize(
            $this->trustedManifest($manifest, $integration, $endpoint),
            ['integration' => $integration],
        );
    }

    private function load(ExternalSchemaEndpoint $endpoint, Request $request): mixed
    {
        if ($endpoint->isFile()) {
            return $this->decode($this->files->get($endpoint->path()), $endpoint->uri);
        }

        $this->guardAllowedHost($endpoint);

        return Http::acceptJson()
            ->withHeaders(['Accept-Language' => $this->acceptLanguage($request)])
            ->retry([100, 250])
            ->timeout($endpoint->timeout)
            ->connectTimeout($endpoint->connectTimeout)
            ->get($endpoint->uri)
            ->throw()
            ->json();
    }

    private function guardAllowedHost(ExternalSchemaEndpoint $endpoint): void
    {
        $host = parse_url($endpoint->uri, PHP_URL_HOST);

        if (! is_string($host) || $host === '') {
            throw new InvalidExternalSchema("External schema endpoint [{$endpoint->uri}] must include a host.");
        }

        if ($endpoint->allowedHosts !== [] && ! in_array($host, $endpoint->allowedHosts, true)) {
            throw new InvalidExternalSchema("External schema endpoint host [{$host}] is not allowed.");
        }
    }

    private function acceptLanguage(Request $request): string
    {
        $header = $request->header('Accept-Language');

        if (is_string($header) && trim($header) !== '') {
            return $header;
        }

        return app()->getLocale();
    }

    private function decode(string $contents, string $source): mixed
    {
        try {
            return json_decode($contents, true, flags: JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            throw new InvalidExternalSchema("External schema source [{$source}] did not return valid JSON.", previous: $exception);
        }
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function manifest(mixed $payload): array
    {
        if (! is_array($payload)) {
            throw new InvalidExternalSchema('External schema payload must be a JSON object or array.');
        }

        $schema = $payload['schema'] ?? $payload;

        if (! is_array($schema) || ! array_is_list($schema)) {
            throw new InvalidExternalSchema('External schema payload must contain a schema list.');
        }

        foreach ($schema as $node) {
            if (! is_array($node)) {
                throw new InvalidExternalSchema('External schema payload must contain only object nodes.');
            }
        }

        return $schema;
    }

    /**
     * @param  list<array<string, mixed>>  $manifest
     * @return list<array<string, mixed>>
     */
    private function trustedManifest(array $manifest, string $integration, ExternalSchemaEndpoint $endpoint): array
    {
        return array_map(
            fn (array $node): array => $this->trustedNode($node, $integration, $endpoint),
            $manifest,
        );
    }

    /**
     * @param  array<string, mixed>  $node
     * @return array<string, mixed>
     */
    private function trustedNode(array $node, string $integration, ExternalSchemaEndpoint $endpoint): array
    {
        $type = $node['type'] ?? null;
        $props = $node['props'] ?? [];

        if (is_array($props)) {
            unset($props['action'], $props['endpoint'], $props['ref'], $props['remote'], $props['tokenEndpoint']);

            if ($type === 'chat.box') {
                unset($props['historyEndpoint'], $props['streamEndpoint']);
            }

            if (is_string($type) && array_key_exists($type, self::EXTERNAL_URL_PROPS)) {
                foreach (self::EXTERNAL_URL_PROPS[$type] as $property) {
                    if (is_string($props[$property] ?? null)) {
                        $this->guardAllowedExternalUrl($endpoint, $props[$property], $property);
                    }
                }

                $props['remote'] = $this->remoteAccess($node, $props, $integration, $type);
                unset($props['audience'], $props['resource'], $props['scopes']);
            }

            $node['props'] = $props;
        }

        $schema = $node['schema'] ?? [];

        if (is_array($schema) && array_is_list($schema)) {
            $node['schema'] = array_map(
                fn (mixed $child): mixed => is_array($child) ? $this->trustedNode($child, $integration, $endpoint) : $child,
                $schema,
            );
        }

        return $node;
    }

    /**
     * @param  array<string, mixed>  $node
     * @param  array<string, mixed>  $props
     */
    private function remoteAccess(array $node, array $props, string $integration, string $type): RemoteAccess
    {
        $nodeId = $this->nodeId($node, $type);
        $audience = $props['audience'] ?? null;

        if (! is_string($audience) || trim($audience) === '') {
            throw new InvalidExternalSchema("Remote external schema node [{$type}] must include an audience.");
        }

        $scopes = $this->scopes($props['scopes'] ?? []);

        return new RemoteAccess(
            integration: $integration,
            audience: $audience,
            scopes: $scopes,
            nodeId: $nodeId,
            nodeType: $type,
            ref: $this->references->seal($type, $nodeId, [
                'audience' => $audience,
                'integration' => $integration,
                'scopes' => $scopes,
            ]),
        );
    }

    /**
     * @param  array<string, mixed>  $node
     */
    private function nodeId(array $node, string $type): string
    {
        $nodeId = $node['id'] ?? $node['key'] ?? null;

        if (! is_string($nodeId) || $nodeId === '') {
            throw new InvalidExternalSchema("Remote external schema node [{$type}] must include an id or key.");
        }

        return $nodeId;
    }

    /**
     * @return list<string>
     */
    private function scopes(mixed $scopes): array
    {
        if (! is_array($scopes) || ! array_is_list($scopes)) {
            throw new InvalidExternalSchema('Remote external schema scopes must be a list of strings.');
        }

        foreach ($scopes as $scope) {
            if (! is_string($scope)) {
                throw new InvalidExternalSchema('Remote external schema scopes must be a list of strings.');
            }
        }

        return $scopes;
    }

    private function guardAllowedExternalUrl(ExternalSchemaEndpoint $endpoint, string $url, string $property): void
    {
        $host = parse_url($url, PHP_URL_HOST);

        if (! is_string($host) || $host === '') {
            return;
        }

        if ($endpoint->allowedHosts !== [] && ! in_array($host, $endpoint->allowedHosts, true)) {
            throw new InvalidExternalSchema("External schema {$property} host [{$host}] is not allowed.");
        }
    }
}
