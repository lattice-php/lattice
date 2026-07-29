<?php

declare(strict_types=1);

namespace Lattice\Lattice\Attributes;

use Attribute;
use Lattice\Lattice\Core\Contracts\DeclaresGate;
use Lattice\Lattice\Ui\Enums\PageContainer;
use Lattice\Lattice\Ui\Enums\PageLayout;

#[Attribute(Attribute::TARGET_CLASS)]
final readonly class AsPage implements DeclaresGate
{
    /**
     * @var array<int, string>
     */
    private array $can;

    /**
     * @param  array<int, string>|string|null  $middleware
     * @param  string|array<int, string>  $can
     */
    public function __construct(
        public ?string $route = null,
        public ?string $name = null,
        public PageLayout|string|null $layout = null,
        public PageContainer|string|null $container = null,
        public array|string|null $middleware = null,
        string|array $can = [],
    ) {
        $this->can = (array) $can;
    }

    public function can(): array
    {
        return $this->can;
    }
}
