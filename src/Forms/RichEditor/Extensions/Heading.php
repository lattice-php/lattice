<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\RichEditor\Extensions;

use InvalidArgumentException;
use Lattice\Lattice\Forms\RichEditor\Attributes\AsEditorExtension;
use Lattice\Lattice\Forms\RichEditor\EditorExtension;

#[AsEditorExtension('heading')]
final class Heading extends EditorExtension
{
    /**
     * @var list<int>
     */
    public array $levels = [1, 2, 3, 4, 5, 6];

    public function levels(int ...$levels): static
    {
        if ($levels === []) {
            throw new InvalidArgumentException('Heading requires at least one level.');
        }

        foreach ($levels as $level) {
            if ($level < 1 || $level > 6) {
                throw new InvalidArgumentException(sprintf('Heading level [%d] must be between 1 and 6.', $level));
            }
        }

        $this->levels = array_values($levels);

        return $this;
    }
}
