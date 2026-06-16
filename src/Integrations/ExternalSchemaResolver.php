<?php
declare(strict_types=1);

namespace Lattice\Lattice\Integrations;

use Illuminate\Filesystem\Filesystem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use JsonException;
use Lattice\Lattice\Core\Components\Component;

final readonly class ExternalSchemaResolver
{
    public function __construct(
        private ExternalSchemaNormalizer $normalizer,
        private IntegrationRegistry $integrations,
        private Filesystem $files,
    ) {}

    /**
     * @return list<Component>
     */
    public function resolve(IntegrationDefinition $definition, ExternalSchemaEndpoint $endpoint, Request $request): array
    {
        $integration = $this->integrations->keyForDefinition($definition::class);
        $manifest = $this->manifest($this->load($endpoint));

        return $this->normalizer->normalize(
            $this->trustedManifest($manifest, $integration),
            ['integration' => $integration],
        );
    }

    private function load(ExternalSchemaEndpoint $endpoint): mixed
    {
        if ($endpoint->isFile()) {
            return $this->decode($this->files->get($endpoint->path()), $endpoint->uri);
        }

        $this->guardAllowedHost($endpoint);

        return Http::acceptJson()
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
    private function trustedManifest(array $manifest, string $integration): array
    {
        return array_map(
            fn (array $node): array => $this->trustedNode($node, $integration),
            $manifest,
        );
    }

    /**
     * @param  array<string, mixed>  $node
     * @return array<string, mixed>
     */
    private function trustedNode(array $node, string $integration): array
    {
        $props = $node['props'] ?? [];

        if (is_array($props)) {
            unset($props['ref']);

            if (($node['type'] ?? null) === 'integration.browser-data') {
                $props['endpoint'] = $this->integrations->tokenEndpointFor($integration);
                $props['tokenEndpoint'] = $this->integrations->tokenEndpointFor($integration);
            }

            $node['props'] = $props;
        }

        $schema = $node['schema'] ?? [];

        if (is_array($schema) && array_is_list($schema)) {
            $node['schema'] = array_map(
                fn (mixed $child): mixed => is_array($child) ? $this->trustedNode($child, $integration) : $child,
                $schema,
            );
        }

        return $node;
    }
}
