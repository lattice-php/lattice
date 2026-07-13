<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\RichEditor\Extensions;

use InvalidArgumentException;
use Lattice\Lattice\Forms\RichEditor\Attributes\AsEditorExtension;
use Lattice\Lattice\Forms\RichEditor\EditorExtension;

#[AsEditorExtension('table')]
final class Table extends EditorExtension
{
    public int $rows = 3;

    public int $cols = 3;

    public bool $withHeaderRow = true;

    public function rows(int $rows): static
    {
        if ($rows < 1) {
            throw new InvalidArgumentException(sprintf('Table insert rows [%d] must be at least 1.', $rows));
        }

        $this->rows = $rows;

        return $this;
    }

    public function cols(int $cols): static
    {
        if ($cols < 1) {
            throw new InvalidArgumentException(sprintf('Table insert cols [%d] must be at least 1.', $cols));
        }

        $this->cols = $cols;

        return $this;
    }

    public function withHeaderRow(bool $withHeaderRow = true): static
    {
        $this->withHeaderRow = $withHeaderRow;

        return $this;
    }
}
