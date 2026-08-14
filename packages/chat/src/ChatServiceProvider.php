<?php
declare(strict_types=1);

namespace Lattice\Chat;

use Illuminate\Support\ServiceProvider;
use Lattice\Core\Facades\Lattice;

final class ChatServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Lattice::translations('chat', __DIR__.'/../lang');
    }
}
