<?php
declare(strict_types=1);

namespace Workbench\App\Forms\Fields;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Ui\Components\Tab;
use Lattice\Lattice\Ui\Components\Tabs;
use Lattice\Lattice\Ui\Enums\Icon;
use Lattice\Lattice\Ui\Enums\Orientation;
use Symfony\Component\HttpFoundation\Response;

#[AsForm('workbench.fields.text.form')]
class TextInputFieldForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form->schema([
            Tabs::make('text-variants')
                ->queryKey('type')
                ->orientation(Orientation::Vertical)
                ->defaultValue('basic')
                ->schema([
                    Tab::make('basic', __('workbench.fields.variants.basic'))->schema([
                        TextInput::make('name', __('workbench.forms.showcase.full-name'))
                            ->placeholder(__('workbench.forms.showcase.placeholders.name'))
                            ->tooltip('Your legal name. See <a href="/form/fields/text">the form guide</a>.')
                            ->rules(['nullable', 'string', 'max:255']),
                    ]),
                    Tab::make('email', __('workbench.fields.variants.email'))->schema([
                        TextInput::make('email', __('workbench.common.email'))
                            ->email()
                            ->prefix(Icon::Send)
                            ->placeholder(__('workbench.forms.showcase.placeholders.email'))
                            ->rules(['nullable', 'email']),
                    ]),
                    Tab::make('copyable', __('workbench.fields.text.copyable'))->schema([
                        TextInput::make('referral_code', __('workbench.forms.showcase.referral-code'))
                            ->value('REF-2026-LATTICE')
                            ->copyable(),
                    ]),
                    Tab::make('affixes', __('workbench.fields.variants.affixes'))->schema([
                        TextInput::make('handle', __('workbench.fields.text.handle'))
                            ->prefix('@')
                            ->rules(['nullable', 'string', 'max:64']),
                        TextInput::make('website', __('workbench.fields.text.website'))
                            ->prefix('https://')
                            ->suffix('.dev')
                            ->rules(['nullable', 'string', 'max:255']),
                    ]),
                ]),
        ]);
    }

    public function handle(Request $request): Response
    {
        $this->validate($request);

        return redirect('/form/fields/text');
    }
}
