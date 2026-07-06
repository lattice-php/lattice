<?php

declare(strict_types=1);

namespace Lattice\Lattice\Notifications\Support;

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
}
