<?php
declare(strict_types=1);

namespace Lattice\Form\RichEditor\Extensions;

use Lattice\Form\RichEditor\Attributes\AsEditorExtension;
use Lattice\Form\RichEditor\EditorExtension;

#[AsEditorExtension('underline')]
final class Underline extends EditorExtension
{
    /**
     * @var list<string>
     */
    protected array $serverTypes = ['underline'];
}
