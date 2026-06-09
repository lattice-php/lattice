<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Core\Enums;

enum HttpMethod: string
{
    case Get = 'get';
    case Post = 'post';
    case Put = 'put';
    case Patch = 'patch';
    case Delete = 'delete';
}
