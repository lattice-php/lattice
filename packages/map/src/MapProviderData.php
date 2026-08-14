<?php

declare(strict_types=1);

namespace Lattice\Map;

use InvalidArgumentException;
use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
final readonly class MapProviderData
{
    /** @param array<string, mixed> $options */
    public function __construct(
        public string $name,
        public array $options,
        public int $minimumZoom,
        public int $maximumZoom,
    ) {
        if (trim($this->name) === '') {
            throw new InvalidArgumentException('Map provider name must not be empty.');
        }

        if ($this->minimumZoom < 0 || $this->maximumZoom > 24 || $this->minimumZoom > $this->maximumZoom) {
            throw new InvalidArgumentException('Map provider zoom bounds must be between 0 and 24.');
        }
    }
}
