<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\Discovery;

use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\Form;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\FormDefinition;
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
