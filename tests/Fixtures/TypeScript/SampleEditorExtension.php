<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\TypeScript;

use Lattice\Lattice\Forms\RichEditor\Attributes\AsEditorExtension;
use Lattice\Lattice\Forms\RichEditor\EditorExtension;

#[AsEditorExtension('sample-extension')]
class SampleEditorExtension extends EditorExtension
{
    public bool $enabled = true;
}
