<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
final readonly class Breadcrumb
{
    public function __construct(
        public string $title,
        public string $href,
    ) {}

    public static function make(string $title, string $href): self
    {
        return new self($title, $href);
    }

    /**
     * @param  class-string  $page
     * @param  array<string, mixed>  $parameters
     */
    public static function toPage(string $page, array $parameters = []): self
    {
        return new self(PageRoute::label($page), PageRoute::href($page, $parameters));
    }

    public function title(string $title): self
    {
        return new self($title, $this->href);
    }
}
