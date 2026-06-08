<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Concerns;

use Bambamboole\Lattice\Enums\ToastType;
use Bambamboole\Lattice\Toasts\ToastMessage;
use Inertia\Inertia;
use Inertia\ResponseFactory;

trait CreatesToastMessages
{
    protected function toast(ToastType $type, string $message): ResponseFactory
    {
        return Inertia::flash('toast', ToastMessage::make($type, $message));
    }
}
