<?php

declare(strict_types=1);

namespace Lattice\ApiReference;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Core\Contracts\ResolvesRemoteSourceEndpoints;
use Lattice\Core\Enums\Breakpoint;
use Lattice\Core\Remote\RemoteAccess;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Components\Concerns\SealsReferences;
use LogicException;

#[AsComponent('api-reference')]
final class ApiReference extends Component
{
    use SealsReferences;

    /** @var array<string, mixed> */
    public array $spec = [];

    public ?string $url = null;

    public ?string $operation = null;

    /** @var list<string>|null */
    public ?array $tags = null;

    public ?string $defaultOperation = null;

    public bool $hideHeader = false;

    public bool $hideBaseUrl = false;

    public ?string $title = null;

    public int $expandDepth = 2;

    public Breakpoint $twoColumnBreakpoint = Breakpoint::Lg;

    public ?string $token = null;

    /** @var list<RemoteAccess>|null */
    public ?array $remoteTokens = null;

    private ?string $tokenSource = null;

    private ?string $tokenAudience = null;

    public static function make(?string $key = null): static
    {
        return new self($key);
    }

    /**
     * @param  array<string, mixed>  $spec
     */
    public function spec(array $spec): static
    {
        $this->spec = $spec;

        return $this;
    }

    public function url(string $url): static
    {
        $this->url = $url;

        return $this;
    }

    public function operation(string $id): static
    {
        $this->operation = $id;

        return $this;
    }

    /**
     * @param  string|array<int, string>  $tags
     */
    public function tag(string|array $tags): static
    {
        $this->tags = is_array($tags) ? array_values($tags) : [$tags];

        return $this;
    }

    public function defaultOperation(string $id): static
    {
        $this->defaultOperation = $id;

        return $this;
    }

    public function hideHeader(bool $hide = true): static
    {
        $this->hideHeader = $hide;

        return $this;
    }

    public function hideBaseUrl(bool $hide = true): static
    {
        $this->hideBaseUrl = $hide;

        return $this;
    }

    public function title(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function expandDepth(int $depth): static
    {
        $this->expandDepth = $depth;

        return $this;
    }

    public function twoColumnBreakpoint(Breakpoint $breakpoint): static
    {
        $this->twoColumnBreakpoint = $breakpoint;

        return $this;
    }

    public function token(string $token): static
    {
        $this->token = $token;

        return $this;
    }

    /**
     * Fetch scoped access tokens lazily through the named remote source when a
     * request is executed, instead of shipping a static token(). Requires an
     * inline spec() and an id().
     */
    public function tokenSource(string $source, string $audience): static
    {
        $this->tokenSource = $source;
        $this->tokenAudience = $audience;

        return $this;
    }

    /**
     * @param  array<string, mixed>  $props
     * @return array<string, mixed>
     */
    #[\Override]
    protected function decorateProps(array $props): array
    {
        if ($this->tokenSource !== null && $this->tokenAudience !== null) {
            if ($this->spec === []) {
                throw new LogicException(
                    'Api reference component must be given an inline spec() before tokenSource() can seal per-operation scope sets.',
                );
            }

            $id = $this->requireId('Api reference', 'remote token access');
            $endpoint = app(ResolvesRemoteSourceEndpoints::class)->endpointFor($this->tokenSource);

            $props['remoteTokens'] = array_map(
                fn (array $scopes): RemoteAccess => new RemoteAccess(
                    source: $this->tokenSource,
                    audience: $this->tokenAudience,
                    scopes: $scopes,
                    nodeId: $id,
                    nodeType: $this->type(),
                    tokenEndpoint: $endpoint,
                    ref: $this->sealRef($id, [
                        'audience' => $this->tokenAudience,
                        'source' => $this->tokenSource,
                        'scopes' => $scopes,
                    ]),
                ),
                $this->operationScopeSets(),
            );
        }

        return parent::decorateProps($props);
    }

    /**
     * The distinct token scope sets of the spec's operations, mirroring
     * operationTokenScopes() on the client so every scope set the playground
     * can request has a sealed reference.
     *
     * @return list<list<string>>
     */
    private function operationScopeSets(): array
    {
        $sets = [];

        foreach ($this->spec['paths'] ?? [] as $operations) {
            if (! is_array($operations)) {
                continue;
            }

            foreach ($operations as $method => $operation) {
                $isHttpMethod = in_array($method, ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'], true);

                if (! $isHttpMethod || ! is_array($operation)) {
                    continue;
                }

                $security = array_key_exists('security', $operation)
                    ? $operation['security']
                    : ($this->spec['security'] ?? []);
                $scopes = $this->tokenScopes($security);

                if ($scopes !== null) {
                    $sets[implode(' ', $scopes)] = $scopes;
                }
            }
        }

        return array_values($sets);
    }

    /**
     * @return list<string>|null
     */
    private function tokenScopes(mixed $security): ?array
    {
        if (! is_array($security)) {
            return null;
        }

        foreach ($security as $requirement) {
            if (! is_array($requirement)) {
                continue;
            }

            $hasBearerScheme = false;
            $scopes = [];

            foreach ($requirement as $scheme => $schemeScopes) {
                if (! $this->isBearerScheme((string) $scheme)) {
                    continue;
                }

                $hasBearerScheme = true;

                foreach (is_array($schemeScopes) ? $schemeScopes : [] as $scope) {
                    if (is_string($scope)) {
                        $scopes[] = $scope;
                    }
                }
            }

            if ($hasBearerScheme) {
                $scopes = array_values(array_unique($scopes));
                sort($scopes);

                return $scopes;
            }
        }

        return null;
    }

    private function isBearerScheme(string $name): bool
    {
        $definition = $this->spec['components']['securitySchemes'][$name] ?? null;

        if (is_array($definition) && is_string($definition['$ref'] ?? null)) {
            $resolvedName = str_replace('#/components/securitySchemes/', '', $definition['$ref']);
            $definition = $this->spec['components']['securitySchemes'][$resolvedName] ?? $definition;
        }

        if (! is_array($definition)) {
            return false;
        }

        $type = $definition['type'] ?? null;

        return $type === 'oauth2'
            || ($type === 'http' && strtolower((string) ($definition['scheme'] ?? '')) === 'bearer');
    }
}
