<?php

declare(strict_types=1);

namespace Lattice\Lattice\Attributes;

use Attribute;
use Lattice\Lattice\Ui\Enums\PageContainer;
use Lattice\Lattice\Ui\Enums\PageLayout;

#[Attribute(Attribute::TARGET_CLASS)]
final readonly class AsPage
{
    /**
     * @param  array<int, string>|string|null  $middleware
     */
    public function __construct(
        public ?string $route = null,
        public ?string $name = null,
        public PageLayout|string|null $layout = null,
        public PageContainer|string|null $container = null,
        public array|string|null $middleware = null,
    ) {}
}
