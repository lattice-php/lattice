<?php
declare(strict_types=1);

namespace Lattice\Form\RichEditor\Extensions;

use InvalidArgumentException;
use Lattice\Form\RichEditor\Attributes\AsEditorExtension;
use Lattice\Form\RichEditor\EditorExtension;

#[AsEditorExtension('link')]
final class Link extends EditorExtension
{
    /**
     * @var list<string>
     */
    public array $protocols = ['http', 'https', 'mailto'];

    /**
     * @var list<string>
     */
    protected array $serverTypes = ['link'];

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
