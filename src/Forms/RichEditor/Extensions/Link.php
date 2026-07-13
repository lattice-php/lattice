<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\RichEditor\Extensions;

use InvalidArgumentException;
use Lattice\Lattice\Forms\RichEditor\Attributes\AsEditorExtension;
use Lattice\Lattice\Forms\RichEditor\EditorExtension;

#[AsEditorExtension('link')]
final class Link extends EditorExtension
{
    /**
     * @var list<string>
     */
    public array $protocols = ['http', 'https', 'mailto'];

    public bool $openOnClick = false;

    public function protocols(string ...$protocols): static
    {
        if ($protocols === []) {
            throw new InvalidArgumentException('Link requires at least one protocol.');
        }

        $this->protocols = array_values($protocols);

        return $this;
    }

    public function openOnClick(bool $openOnClick = true): static
    {
        $this->openOnClick = $openOnClick;

        return $this;
    }
}
