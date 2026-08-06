<?php
declare(strict_types=1);

namespace Lattice\Tests\Fixtures\Media;

final class DenyMediaPolicy
{
    public function viewAny(): bool
    {
        return false;
    }

    public function create(): bool
    {
        return false;
    }
}
