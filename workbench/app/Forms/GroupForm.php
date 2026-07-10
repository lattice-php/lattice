<?php
declare(strict_types=1);

namespace Workbench\App\Forms;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Ui\Components\Card;
use Symfony\Component\HttpFoundation\Response;
use Workbench\App\Models\Group;

#[AsForm('workbench.groups.form')]
class GroupForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form->schema([
            Card::make(__('workbench.commerce.groups.form.card'))->schema([
                TextInput::make('name', __('workbench.commerce.groups.fields.name'))
                    ->rules(['required', 'string', 'max:255']),
            ]),
        ]);
    }

    public function handle(Request $request): Response
    {
        $group = $this->group();
        $validated = $this->validate($request);

        if (! $group instanceof Group) {
            Group::query()->create($validated);
        } else {
            $group->update($validated);
        }

        return redirect('/groups');
    }

    private function group(): ?Group
    {
        $id = $this->context('group_id');

        if ($id === null || $id === '') {
            return null;
        }

        return Group::query()->findOrFail($id);
    }
}
