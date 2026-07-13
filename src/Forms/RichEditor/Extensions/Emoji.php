<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\RichEditor\Extensions;

use InvalidArgumentException;
use Lattice\Lattice\Forms\RichEditor\Attributes\AsEditorExtension;
use Lattice\Lattice\Forms\RichEditor\EditorExtension;

#[AsEditorExtension('emoji')]
final class Emoji extends EditorExtension
{
    /**
     * @var list<string>
     */
    public array $emojis = ['😀', '😅', '😂', '🥳', '😎', '🤔', '👍', '🙏', '🔥', '🎉', '🚀', '💡', '✅', '❌', '⭐', '❤️'];

    public function emojis(string ...$emojis): static
    {
        if ($emojis === []) {
            throw new InvalidArgumentException('Emoji requires at least one emoji.');
        }

        $this->emojis = array_values($emojis);

        return $this;
    }
}
