<?php
declare(strict_types=1);

namespace Lattice\Form\Contracts;

use Illuminate\Http\Request;
use Lattice\Core\Http\SubRequest;
use Lattice\Core\Option;
use Lattice\Form\Components\Form;
use Lattice\Form\Components\SignedUpload;
use Lattice\Form\ResolveResponse;

interface InteractsWithForm
{
    /** @return array<string, mixed> */
    public function validate(Request $request): array;

    public function resolveFormSchema(Request $request): ?Form;

    /** @return array{options: list<Option>} */
    public function searchOptions(Request $request, SubRequest $sub): array;

    public function resolveFields(Request $request): ResolveResponse;

    public function signUpload(Request $request, SubRequest $sub): SignedUpload;
}
