<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use InvalidArgumentException;
use Lattice\Lattice\Attributes\WireType;

final class WireFamilies
{
    /** @var array<string, WireFamily> */
    private array $families = [];

    /** @var array<string, string> */
    private array $sources = [];

    public function registerSource(string $path): void
    {
        $path = realpath($path) ?: $path;
        $this->sources[$path] = $path;
    }

    /** @return list<string> */
    public function sources(): array
    {
        return array_values($this->sources);
    }

    public function register(WireFamily $family): void
    {
        if (isset($this->families[$family->category])) {
            throw new InvalidArgumentException(sprintf('Wire family [%s] is already registered.', $family->category));
        }

        $this->families[$family->category] = $family;
    }

    /** @return list<WireFamily> */
    public function all(): array
    {
        return array_values($this->families);
    }

    /** @return list<WireFamily> */
    public function markerFamilies(): array
    {
        return array_values(array_filter(
            $this->families,
            static fn (WireFamily $family): bool => $family->marker,
        ));
    }

    /** @return list<WireFamily> */
    public function valueFamilies(): array
    {
        return array_values(array_filter(
            $this->families,
            static fn (WireFamily $family): bool => ! $family->marker,
        ));
    }

    public function categoryFor(WireType $attribute): string
    {
        foreach ($this->markerFamilies() as $family) {
            if ($attribute::class === $family->attribute) {
                return $family->category;
            }
        }

        foreach ($this->markerFamilies() as $family) {
            if (is_a($attribute, $family->attribute)) {
                return $family->category;
            }
        }

        throw new InvalidArgumentException(sprintf('No wire family is registered for [%s].', $attribute::class));
    }
}
