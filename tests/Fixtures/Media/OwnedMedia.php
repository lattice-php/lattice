<?php
declare(strict_types=1);

namespace Lattice\Tests\Fixtures\Media;

use Illuminate\Contracts\Auth\Authenticatable;
use Lattice\Media\Contracts\Ownable;
use Lattice\Media\Models\Media;

final class OwnedMedia extends Media implements Ownable
{
    public function ownedBy(Authenticatable $user): bool
    {
        return (int) $this->uploaded_by === (int) $user->getAuthIdentifier();
    }
}
