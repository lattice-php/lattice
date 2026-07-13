<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\RichEditor\Extensions;

use Lattice\Lattice\Forms\RichEditor\Attributes\AsEditorExtension;
use Lattice\Lattice\Forms\RichEditor\EditorExtension;

#[AsEditorExtension('bold')]
final class Bold extends EditorExtension
{
    /**
     * @var list<string>
     */
    protected array $serverTypes = ['bold'];
}
