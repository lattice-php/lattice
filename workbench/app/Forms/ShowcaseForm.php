<?php
declare(strict_types=1);

namespace Workbench\App\Forms;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Lattice\Lattice\Attributes\Form;
use Lattice\Lattice\Core\Components\Card;
use Lattice\Lattice\Core\Components\Grid;
use Lattice\Lattice\Forms\Components\Checkbox;
use Lattice\Lattice\Forms\Components\Choice;
use Lattice\Lattice\Forms\Components\DateInput;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\Components\HiddenInput;
use Lattice\Lattice\Forms\Components\NumberInput;
use Lattice\Lattice\Forms\Components\PasswordInput;
use Lattice\Lattice\Forms\Components\RichEditor;
use Lattice\Lattice\Forms\Components\Select;
use Lattice\Lattice\Forms\Components\Textarea;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Forms\FormDefinition;
use Symfony\Component\HttpFoundation\Response;
use Workbench\App\Models\Product;

#[Form('workbench.showcase.form')]
class ShowcaseForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form
            ->precognitive(500)
            ->submitLabel(__('workbench.forms.showcase.submit'))
            ->schema([
                Card::make(__('workbench.forms.showcase.profile'), __('workbench.forms.showcase.profile-description'))->schema([
                    Grid::make()->columns(2)->schema([
                        TextInput::make('name', __('workbench.forms.showcase.full-name'))
                            ->placeholder(__('workbench.forms.showcase.placeholders.name'))
                            ->tooltip('Your legal name. See <a href="/showcase">the form guide</a>.')
                            ->rules(['required', 'string', 'max:255']),
                        TextInput::make('email', __('workbench.common.email'))
                            ->email()
                            ->placeholder(__('workbench.forms.showcase.placeholders.email'))
                            ->rules(['required']),
                    ]),
                    PasswordInput::make('password', __('workbench.forms.showcase.password'))
                        ->needsConfirmation()
                        ->rules(['required', 'string', 'min:8', 'confirmed']),
                    Textarea::make('bio', __('workbench.common.bio'))
                        ->rows(4)
                        ->placeholder(__('workbench.forms.showcase.your-bio'))
                        ->rules(['nullable', 'string', 'max:1000']),
                ]),

                Card::make(__('workbench.forms.showcase.details'))->schema([
                    Grid::make()->columns(2)->schema([
                        NumberInput::make('age', __('workbench.forms.showcase.age'))
                            ->min(0)
                            ->max(120)
                            ->rules(['nullable', 'integer', 'min:0', 'max:120']),
                        DateInput::make('birthday', __('workbench.forms.showcase.birthday'))
                            ->max('2026-01-01')
                            ->rules(['nullable', 'date']),
                    ]),
                    NumberInput::make('satisfaction', __('workbench.forms.showcase.satisfaction'))
                        ->slider()
                        ->min(0)
                        ->max(10),
                    Choice::make('plan', __('workbench.forms.showcase.plan'))
                        ->options([
                            Choice::option(__('workbench.forms.showcase.free'), 'free'),
                            Choice::option(__('workbench.forms.showcase.pro'), 'pro'),
                            Choice::option(__('workbench.forms.showcase.enterprise'), 'enterprise'),
                        ])
                        ->rules(['required', Rule::in(['free', 'pro', 'enterprise'])]),
                ]),

                Card::make(__('workbench.forms.showcase.conditional-fields'), __('workbench.forms.showcase.conditional-description'))->schema([
                    Choice::make('account_type', __('workbench.forms.showcase.account-type'))
                        ->options([
                            Choice::option(__('workbench.forms.showcase.personal'), 'personal'),
                            Choice::option(__('workbench.forms.showcase.business'), 'business'),
                        ]),
                    TextInput::make('company', __('workbench.forms.dependent.company'))
                        ->dependsOn('account_type', 'business')
                        ->requiredWhen('account_type', 'business')
                        ->rules(['string', 'max:255']),
                ]),

                Card::make(__('workbench.forms.showcase.order-total'), __('workbench.forms.showcase.order-total-description'))->schema([
                    Grid::make()->columns(2)->schema([
                        NumberInput::make('quantity', __('workbench.forms.showcase.quantity'))->min(1),
                        NumberInput::make('unit_price', __('workbench.common.unit-price'))->min(0)->step(0.01),
                    ]),
                    TextInput::make('total', __('workbench.forms.dependent.total'))
                        ->readOnly()
                        ->dependsOn(
                            ['quantity', 'unit_price'],
                            fn ($component, FormData $data) => $component->value(
                                $data->float('quantity') * $data->float('unit_price'),
                            ),
                        ),
                ]),

                Card::make(__('workbench.forms.showcase.selection'), __('workbench.forms.showcase.selection-description'))->schema([
                    Select::make('country', __('workbench.forms.showcase.country'))
                        ->placeholder(__('workbench.forms.showcase.pick-country'))
                        ->options([
                            Select::option(__('workbench.forms.showcase.germany'), 'de'),
                            Select::option(__('workbench.forms.showcase.france'), 'fr'),
                            Select::option(__('workbench.forms.showcase.spain'), 'es'),
                            Select::option(__('workbench.forms.showcase.italy'), 'it'),
                        ])
                        ->rules(['nullable', 'string']),
                    Select::make('related_products', __('workbench.forms.product.fields.related-products'))
                        ->multiple()
                        ->placeholder(__('workbench.common.search-products'))
                        ->searchable(fn (string $search) => Product::query()
                            ->where('name', 'like', "%{$search}%")
                            ->orderBy('name')
                            ->limit(10)
                            ->get()
                            ->map(fn (Product $product) => Select::option($product->name, (string) $product->id))
                            ->all())
                        ->resolveSelectedUsing(fn (array $values) => Product::query()
                            ->whereIn('id', $values)
                            ->get()
                            ->map(fn (Product $product) => Select::option($product->name, (string) $product->id))
                            ->all())
                        ->rules(['nullable', 'array']),
                ]),

                Card::make(__('workbench.common.article'))->schema([
                    RichEditor::make('article', __('workbench.common.article')),
                ]),

                Card::make(__('workbench.forms.showcase.consent'))->schema([
                    Checkbox::make('newsletter', __('workbench.forms.showcase.newsletter')),
                    Checkbox::make('terms', __('workbench.forms.showcase.terms'))
                        ->rules(['accepted']),
                ]),

                HiddenInput::make('source')->value('workbench-showcase'),
            ]);
    }

    public function handle(Request $request): Response
    {
        $this->validate($request);

        return redirect('/showcase');
    }
}
