<?php
declare(strict_types=1);

namespace Workbench\App\Forms;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\Repeater;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\Components\Wizard;
use Lattice\Lattice\Forms\Components\WizardStep;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Http\LatticeResponse;
use Lattice\Lattice\Ui\Components\Grid;
use Lattice\Lattice\Ui\Components\Text;

#[AsForm('workbench.checkout-wizard')]
class CheckoutWizardForm extends FormDefinition
{
    public function definition(Form $form, Request $request): Form
    {
        return $form->schema([
            Wizard::make([
                WizardStep::make('customer')
                    ->description(__('workbench.pages.wizard.steps.customer.description'))
                    ->schema([
                        TextInput::make('name', __('workbench.pages.wizard.fields.name'))->required(),
                        TextInput::make('email', __('workbench.pages.wizard.fields.email'))
                            ->rules(['required', 'email']),
                    ]),
                WizardStep::make('items')
                    ->description(__('workbench.pages.wizard.steps.items.description'))
                    ->schema([
                        Repeater::make('items', __('workbench.pages.wizard.fields.items'))->schema([
                            TextInput::make('sku', __('workbench.pages.wizard.fields.sku'))->required(),
                            TextInput::make('qty', __('workbench.pages.wizard.fields.qty'))
                                ->rules(['required', 'integer']),
                        ]),
                    ]),
                WizardStep::make('review')
                    ->description(__('workbench.pages.wizard.steps.review.description'))
                    ->schema([
                        Text::make(__('workbench.pages.wizard.steps.review.body')),
                        Grid::make()->columns(2)->schema([
                            TextInput::make('review_name', __('workbench.pages.wizard.fields.name'))
                                ->readOnly()
                                ->value(fn (FormData $data): string => $data->string('name')),
                            TextInput::make('review_email', __('workbench.pages.wizard.fields.email'))
                                ->readOnly()
                                ->value(fn (FormData $data): string => $data->string('email')),
                        ]),
                        TextInput::make('review_items', __('workbench.pages.wizard.fields.items'))
                            ->readOnly()
                            ->value(function (FormData $data): string {
                                $lines = [];

                                foreach ((array) $data->get('items', []) as $row) {
                                    if (is_array($row) && ($row['sku'] ?? '') !== '') {
                                        $lines[] = trim(($row['qty'] ?? '1').' × '.$row['sku']);
                                    }
                                }

                                return implode(', ', $lines);
                            }),
                    ]),
            ]),
        ]);
    }

    public function handle(Request $request): LatticeResponse
    {
        $this->validate($request);

        return $this->toast(__('workbench.pages.wizard.submitted'))->back();
    }
}
