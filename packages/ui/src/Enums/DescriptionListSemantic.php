<?php

declare(strict_types=1);

namespace Lattice\Ui\Enums;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum DescriptionListSemantic: string
{
    case DescriptionList = 'description-list';
    case List = 'list';
}
