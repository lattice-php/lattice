<?php
declare(strict_types=1);

namespace Lattice\Media\Policies;

use Illuminate\Contracts\Auth\Authenticatable;

final class MediaFolderPolicy
{
    public function viewAny(?Authenticatable $user): bool
    {
        return $user instanceof Authenticatable;
    }

    public function create(?Authenticatable $user): bool
    {
        return $user instanceof Authenticatable;
    }

    public function update(?Authenticatable $user): bool
    {
        return $user instanceof Authenticatable;
    }

    public function delete(?Authenticatable $user): bool
    {
        return $user instanceof Authenticatable;
    }
}
