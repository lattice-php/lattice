<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Core\Concerns;

use Bambamboole\Lattice\Toasts\ToastMessage;
use Bambamboole\Lattice\Toasts\ToastType;
use Inertia\Inertia;
use Inertia\ResponseFactory;

trait CreatesToastMessages
{
    protected function toast(ToastType $type, string $message): ResponseFactory
    {
        return Inertia::flash('toast', ToastMessage::make($type, $message));
    }
}
