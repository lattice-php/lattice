<?php
declare(strict_types=1);

namespace Lattice\Media\Contracts;

use Illuminate\Contracts\Auth\Authenticatable;

/**
 * Consumers overriding `media.model` may implement this on their subclass to
 * scope media abilities (update/delete/attach) to an owner or tenant. A
 * `Media` model that doesn't implement it keeps the package's default: any
 * authenticated user may act on any media.
 */
interface Ownable
{
    public function ownedBy(Authenticatable $user): bool;
}
