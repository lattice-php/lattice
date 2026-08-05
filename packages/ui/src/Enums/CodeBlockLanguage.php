<?php
declare(strict_types=1);

namespace Lattice\Ui\Enums;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum CodeBlockLanguage: string
{
    case Text = 'text';
    case Json = 'json';
    case JavaScript = 'javascript';
    case Shell = 'shell';
    case Php = 'php';
}
