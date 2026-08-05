<?php
declare(strict_types=1);

namespace Lattice\Form\RichEditor\Extensions;

use Lattice\Form\RichEditor\Attributes\AsEditorExtension;
use Lattice\Form\RichEditor\EditorExtension;

#[AsEditorExtension('strike')]
final class Strike extends EditorExtension
{
    /**
     * @var list<string>
     */
    protected array $serverTypes = ['strike'];
}
