<?php

declare(strict_types=1);

namespace Lattice\ApiReference;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Enums\Breakpoint;

#[AsComponent('api-reference')]
final class ApiReference extends Component
{
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
}
