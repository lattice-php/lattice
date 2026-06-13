<?php

declare(strict_types=1);

namespace Lattice\Lattice\Attributes;

use Attribute;
use Lattice\Lattice\Core\Enums\PageContainer;
use Lattice\Lattice\Core\Enums\PageLayout;

#[Attribute(Attribute::TARGET_CLASS)]
final class Page
{
    /**
     * @param  array<int, string>|string|null  $middleware
     */
    public function __construct(
        public readonly ?string $route = null,
        public readonly ?string $name = null,
        public readonly PageLayout|string|null $layout = null,
        public readonly PageContainer|string|null $container = null,
        public readonly array|string|null $middleware = null,
    ) {}
}
