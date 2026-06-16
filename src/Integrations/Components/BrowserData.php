<?php
declare(strict_types=1);

namespace Lattice\Lattice\Integrations\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\IsInteractive;

#[AsComponent('integration.browser-data')]
final class BrowserData extends Component
{
    use IsInteractive {
        decorateProps as decorateInteractiveProps;
    }

    public ?string $endpoint = null;

    public ?string $tokenEndpoint = null;

    public ?string $dataEndpoint = null;

    public ?string $audience = null;

    /**
     * @var list<string>
     */
    public array $scopes = [];

    public ?string $resource = null;

    private ?string $integration = null;

    public static function make(string $id): static
    {
        return (new self)->id($id);
    }

    public function integration(string $integration): static
    {
        $this->integration = $integration;

        return $this;
    }

    public function tokenEndpoint(string $endpoint): static
    {
        $this->endpoint = $endpoint;
        $this->tokenEndpoint = $endpoint;

        return $this;
    }

    public function dataEndpoint(string $endpoint): static
    {
        $this->dataEndpoint = $endpoint;

        return $this;
    }

    public function audience(string $audience): static
    {
        $this->audience = $audience;

        return $this;
    }

    /**
     * @param  list<string>  $scopes
     */
    public function scopes(array $scopes): static
    {
        $this->scopes = $scopes;

        return $this;
    }

    public function resource(string $resource): static
    {
        $this->resource = $resource;

        return $this;
    }

    /**
     * @param  array<string, mixed>  $props
     * @return array<string, mixed>
     */
    protected function decorateProps(array $props): array
    {
        if ($this->integration !== null) {
            $this->context(array_filter([
                'integration' => $this->integration,
                'resource' => $this->resource,
            ], static fn (mixed $value): bool => $value !== null));
        }

        return $this->decorateInteractiveProps($props);
    }
}
