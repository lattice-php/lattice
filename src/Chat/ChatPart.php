<?php

declare(strict_types=1);

namespace Lattice\Lattice\Chat;

use Lattice\Lattice\Chat\Components\TextPart;
use Lattice\Lattice\Chat\Components\ToolCallPart;
use Lattice\Lattice\Ui\Components\Component;

/**
 * A chat part is a component: it serializes to a `{type, props}` node and renders
 * through the same registry-driven renderer as every other component. The static
 * factories build the built-in parts.
 */
abstract class ChatPart extends Component
{
    public static function text(string $text): TextPart
    {
        return TextPart::make($text);
    }

    /**
     * @param  array<string, mixed>  $args
     */
    public static function toolCall(string $name, array $args = []): ToolCallPart
    {
        return ToolCallPart::make($name, $args);
    }
}
