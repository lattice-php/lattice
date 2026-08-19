<?php
declare(strict_types=1);

namespace Workbench\App\Forms;

use Illuminate\Http\Request;
use Lattice\Core\Concerns\ResolvesContextModels;
use Lattice\Form\Attributes\AsForm;
use Lattice\Form\Components\Form as FormComponent;
use Lattice\Form\Components\TextInput;
use Lattice\Form\FormData;
use Lattice\Form\FormDefinition;
use Lattice\Ui\Components\Card;
use Symfony\Component\HttpFoundation\Response;
use Workbench\App\Models\Group;

#[AsForm('workbench.groups.form')]
class GroupForm extends FormDefinition
{
    use ResolvesContextModels;

    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form->schema([
            Card::make(__('workbench.commerce.groups.form.card'))->schema([
                TextInput::make('name', __('workbench.commerce.groups.fields.name'))
                    ->rules(['required', 'string', 'max:255']),
            ]),
        ]);
    }

    public function handle(FormData $data): Response
    {
        $group = $this->group();

        if (! $group instanceof Group) {
            Group::query()->create($data->all());
        } else {
            $group->update($data->all());
        }

        return redirect('/groups');
    }

    private function group(): ?Group
    {
        $id = $this->context('group_id');

        return $id === null || $id === '' ? null : $this->contextModel('group_id', Group::class);
    }
}
