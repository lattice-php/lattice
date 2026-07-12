<?php

declare(strict_types=1);

namespace Lattice\Lattice\Forms\Contracts;

use Illuminate\Http\Request;
use Lattice\Lattice\Forms\Components\SignedUpload;

interface HandlesUploads
{
    public function signUpload(Request $request): SignedUpload;
}
