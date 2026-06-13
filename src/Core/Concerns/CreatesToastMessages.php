<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

use Inertia\Inertia;
use Inertia\ResponseFactory;
use Lattice\Lattice\Core\Enums\ToastVariant;
use Lattice\Lattice\Core\Values\ToastMessage;

trait CreatesToastMessages
{
    protected function toast(ToastVariant $variant, string $message): ResponseFactory
    {
        return Inertia::flash('toast', ToastMessage::make($variant, $message));
    }
}
