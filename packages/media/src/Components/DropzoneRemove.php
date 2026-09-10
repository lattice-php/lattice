<?php
declare(strict_types=1);

namespace Lattice\Media\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Components\Component;

/**
 * The remove control a MediaDropzone places in its document viewer's toolbar.
 * It carries no props: the client reads the field it belongs to from context.
 */
#[AsComponent('media.dropzone-remove')]
final class DropzoneRemove extends Component
{
    public static function make(?string $key = null): static
    {
        return new self($key);
    }
}
