<?php
declare(strict_types=1);

namespace Lattice\Tests\Fixtures\TypeScript;

use Lattice\Form\RichEditor\Attributes\AsEditorExtension;
use Lattice\Form\RichEditor\EditorExtension;

#[AsEditorExtension('sample-extension')]
class SampleEditorExtension extends EditorExtension
{
    public bool $enabled = true;
}
