<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum CodeBlockLanguage: string
{
    case Text = 'text';
    case Json = 'json';
    case JavaScript = 'javascript';
    case Shell = 'shell';
    case Php = 'php';
}
