<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\RichEditor;

use Lattice\Lattice\Forms\RichEditor\Attributes\AsEditorExtension;
use Lattice\Lattice\Forms\RichEditor\EditorExtension;

#[AsEditorExtension('callout')]
final class CalloutExtension extends EditorExtension
{
    protected array $serverTypes = ['callout'];

    public function serverExtensions(): array
    {
        return [new CalloutNode];
    }
}
