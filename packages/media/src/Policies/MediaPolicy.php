<?php
declare(strict_types=1);

namespace Lattice\Media\Policies;

use Illuminate\Contracts\Auth\Authenticatable;
use Lattice\Media\Contracts\Ownable;
use Lattice\Media\Models\Media;

final class MediaPolicy
{
    public function viewAny(?Authenticatable $user): bool
    {
        return $user instanceof Authenticatable;
    }

    public function create(?Authenticatable $user): bool
    {
        return $user instanceof Authenticatable;
    }

    public function update(?Authenticatable $user, Media $media): bool
    {
        return $this->authorize($user, $media);
    }

    public function delete(?Authenticatable $user, Media $media): bool
    {
        return $this->authorize($user, $media);
    }

    public function attach(?Authenticatable $user, Media $media): bool
    {
        return $this->authorize($user, $media);
    }

    private function authorize(?Authenticatable $user, Media $media): bool
    {
        if (! $user instanceof Authenticatable) {
            return false;
        }

        return ! $media instanceof Ownable || $media->ownedBy($user);
    }
}
