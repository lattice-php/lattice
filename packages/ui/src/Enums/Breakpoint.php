<?php
declare(strict_types=1);

namespace Lattice\Ui\Enums;

use InvalidArgumentException;
use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum Breakpoint: string
{
    case Default = 'default';
    case Sm = 'sm';
    case Md = 'md';
    case Lg = 'lg';
    case Xl = 'xl';
    case Xxl = '2xl';

    public static function validateKey(int|string $key): void
    {
        if (! is_string($key) || self::tryFrom($key) === null) {
            throw new InvalidArgumentException(sprintf(
                'Unknown breakpoint "%s". Valid breakpoints: %s.',
                $key,
                implode(', ', array_column(self::cases(), 'value')),
            ));
        }
    }
}
