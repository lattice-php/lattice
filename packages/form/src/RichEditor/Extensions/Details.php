<?php
declare(strict_types=1);

namespace Lattice\Form\RichEditor\Extensions;

use Lattice\Form\RichEditor\Attributes\AsEditorExtension;
use Lattice\Form\RichEditor\EditorExtension;

#[AsEditorExtension('details')]
final class Details extends EditorExtension
{
    /**
     * @var list<string>
     */
    protected array $serverTypes = ['details', 'detailsSummary', 'detailsContent'];
}
