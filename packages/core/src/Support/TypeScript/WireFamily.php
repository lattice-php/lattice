<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use Illuminate\Support\Str;
use Lattice\Lattice\Attributes\WireType;

/**
 * One wire-type family contributed by a package provider.
 */
final readonly class WireFamily
{
    /**
     * @param  class-string<WireType>  $attribute
     * @param  class-string  $reference
     */
    public function __construct(
        public string $category,
        public string $attribute,
        public string $reference,
        public bool $marker = false,
    ) {}

    public function propsMap(): string
    {
        return $this->stem().'PropsMap';
    }

    public function propsInterface(): string
    {
        return $this->stem().'Props';
    }

    public function looseAlias(): string
    {
        return $this->stem();
    }

    private function stem(): string
    {
        return Str::studly($this->category);
    }
}
