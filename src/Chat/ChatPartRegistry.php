<?php

declare(strict_types=1);

namespace Lattice\Lattice\Chat;

use InvalidArgumentException;
use Lattice\Lattice\Chat\Attributes\AsChatPart;
use Lattice\Lattice\Support\Discovery\ClassWalker;

/**
 * The single source of truth for chat-part value objects: wire type → class-string.
 * Built-ins auto-register at boot; consumers register their own parts in a
 * service provider. Drives TypeScript generation and guards wire-type uniqueness.
 */
final class ChatPartRegistry
{
    /**
     * @var array<string, class-string>
     */
    private array $parts = [];

    /**
     * A fresh registry holding only the package's built-in chat parts. Used by the
     * container binding and by TypeScript generation, both of which need the
     * built-in set independent of an application's runtime registrations.
     */
    public static function withBuiltins(): self
    {
        $registry = new self;

        foreach (ClassWalker::classes(__DIR__.'/Parts') as $part) {
            $registry->register($part);
        }

        return $registry;
    }

    /**
     * @param  class-string  $part
     */
    public function register(string $part): void
    {
        $type = AsChatPart::wireTypeForClass($part);

        if (isset($this->parts[$type]) && $this->parts[$type] !== $part) {
            throw new InvalidArgumentException(sprintf(
                'Chat part wire type [%s] is already registered to [%s].',
                $type,
                $this->parts[$type],
            ));
        }

        $this->parts[$type] = $part;
    }

    /**
     * @return array<string, class-string>
     */
    public function all(): array
    {
        return $this->parts;
    }
}
