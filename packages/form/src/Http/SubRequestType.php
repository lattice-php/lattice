<?php
declare(strict_types=1);

namespace Lattice\Lattice\Http;

enum SubRequestType: string
{
    case Schema = 'schema';
    case Upload = 'upload';
    case Search = 'search';
    case Resolve = 'resolve';
}
