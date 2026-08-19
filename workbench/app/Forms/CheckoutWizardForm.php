<?php
declare(strict_types=1);

namespace Workbench\App\Forms;

use Illuminate\Http\Request;
use Lattice\Facades\Effects;
use Lattice\Form\Attributes\AsForm;
use Lattice\Form\Components\Form;
use Lattice\Form\Components\Repeater;
use Lattice\Form\Components\TextInput;
use Lattice\Form\Components\Wizard;
use Lattice\Form\Components\WizardStep;
use Lattice\Form\FormData;
use Lattice\Form\FormDefinition;
use Lattice\Http\LatticeResponse;
use Lattice\Ui\Components\Grid;
use Lattice\Ui\Components\Text;
use Stringable;

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
                                ->value(fn (FormData $data): Stringable => $data->string('name')),
                            TextInput::make('review_email', __('workbench.pages.wizard.fields.email'))
                                ->readOnly()
                                ->value(fn (FormData $data): Stringable => $data->string('email')),
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

    public function handle(): LatticeResponse
    {
        return Effects::respond()->toast(__('workbench.pages.wizard.submitted'))->back();
    }
}
