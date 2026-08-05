<?php
declare(strict_types=1);

namespace Lattice\Tests\Fixtures\Discovery;

use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\Request;
use Lattice\Core\Attributes\AsForm;
use Lattice\Form\Components\Form as FormComponent;
use Lattice\Form\FormDefinition;
use Lattice\Ui\Enums\HttpMethod;
use Symfony\Component\HttpFoundation\Response;

#[AsForm('fixtures.profile')]
class DiscoveredProfileForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form->method(HttpMethod::Patch);
    }

    public function handle(Request $request): Response|Responsable
    {
        $request->session()->put('discovered-form-team', $this->context('team'));

        return response()->noContent();
    }
}
