<?php
declare(strict_types=1);

namespace Lattice\Media\Policies;

use Illuminate\Contracts\Auth\Authenticatable;
use Lattice\Media\Models\Media;

final class MediaPolicy
{
    public function viewAny(?Authenticatable $user): bool
    {
        return $user !== null;
    }

    public function create(?Authenticatable $user): bool
    {
        return $user !== null;
    }

    public function update(?Authenticatable $user, Media $media): bool
    {
        return $user !== null;
    }

    public function delete(?Authenticatable $user, Media $media): bool
    {
        return $user !== null;
    }

    public function attach(?Authenticatable $user, Media $media): bool
    {
        return $user !== null;
    }
}
