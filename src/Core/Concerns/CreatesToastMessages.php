<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Core\Concerns;

use Bambamboole\Lattice\Core\Enums\ToastVariant;
use Bambamboole\Lattice\Core\Values\ToastMessage;
use Inertia\Inertia;
use Inertia\ResponseFactory;

trait CreatesToastMessages
{
    protected function toast(ToastVariant $variant, string $message): ResponseFactory
    {
        return Inertia::flash('toast', ToastMessage::make($variant, $message));
    }
}
