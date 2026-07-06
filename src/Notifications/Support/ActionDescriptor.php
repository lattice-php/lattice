<?php

declare(strict_types=1);

namespace Lattice\Lattice\Notifications\Support;

use InvalidArgumentException;
use JsonSerializable;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Core\Components\Link;

final class ActionDescriptor
{
    /**
     * @param  array<string, mixed>  $arguments
     * @return array<string, mixed>
     */
    public static function action(string $name, array $arguments = [], ?string $label = null): array
    {
        return ['kind' => 'action', 'name' => $name, 'arguments' => $arguments, 'label' => $label];
    }

    /**
     * @return array<string, mixed>
     */
    public static function link(string $label, string $url, bool $newTab = false): array
    {
        return ['kind' => 'link', 'label' => $label, 'url' => $url, 'newTab' => $newTab];
    }

    /**
     * @param  array<string, mixed>  $descriptor
     */
    public static function materialize(array $descriptor): ?JsonSerializable
    {
        return match ($descriptor['kind'] ?? null) {
            'action' => self::materializeAction($descriptor),
            'link' => Link::make($descriptor['label'])->href($descriptor['url']),
            default => null,
        };
    }

    /**
     * @param  array<string, mixed>  $descriptor
     */
    private static function materializeAction(array $descriptor): ?JsonSerializable
    {
        try {
            $action = Action::use($descriptor['name'], $descriptor['arguments'] ?? []);
        } catch (InvalidArgumentException) {
            return null;
        }

        if (($descriptor['label'] ?? null) !== null) {
            $action->label($descriptor['label']);
        }

        return $action;
    }
}
