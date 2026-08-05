<?php
declare(strict_types=1);

namespace Lattice\Form\RichEditor\Extensions;

use InvalidArgumentException;
use Lattice\Form\RichEditor\Attributes\AsEditorExtension;
use Lattice\Form\RichEditor\EditorExtension;

#[AsEditorExtension('text-align')]
final class TextAlign extends EditorExtension
{
    private const array ALIGNMENTS = ['left', 'center', 'right', 'justify'];

    /**
     * @var list<string>
     */
    public array $alignments = self::ALIGNMENTS;

    /**
     * @var list<string>
     */
    protected array $serverTypes = ['textAlign'];

    public function alignments(string ...$alignments): static
    {
        if ($alignments === []) {
            throw new InvalidArgumentException('TextAlign requires at least one alignment.');
        }

        foreach ($alignments as $alignment) {
            if (! in_array($alignment, self::ALIGNMENTS, true)) {
                throw new InvalidArgumentException(sprintf(
                    'Alignment [%s] must be one of [%s].',
                    $alignment,
                    implode(', ', self::ALIGNMENTS),
                ));
            }
        }

        $this->alignments = array_values($alignments);

        return $this;
    }
}
