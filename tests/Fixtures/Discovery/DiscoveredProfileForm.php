<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Tests\Fixtures\Discovery;

use Bambamboole\Lattice\Attributes\Form;
use Bambamboole\Lattice\Enums\HttpMethod;
use Bambamboole\Lattice\Forms\Components\Form as FormComponent;
use Bambamboole\Lattice\Forms\FormDefinition;
use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

#[Form('fixtures.profile')]
class DiscoveredProfileForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form->method(HttpMethod::Patch);
    }

    public function handle(Request $request): Response|Responsable
    {
        $request->session()->put('discovered-form-team', $this->context($request, 'team'));

        return response()->noContent();
    }
}
