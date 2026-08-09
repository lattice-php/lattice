<?php

declare(strict_types=1);

namespace Workbench\App\Forms\Fields;

use Illuminate\Http\Request;
use Lattice\Form\Attributes\AsForm;
use Lattice\Form\Components\Choice;
use Lattice\Form\Components\Form as FormComponent;
use Lattice\Form\Components\PatternInput;
use Lattice\Form\FormDefinition;
use Lattice\Form\PatternInput\PatternToken;
use Symfony\Component\HttpFoundation\Response;

#[AsForm('workbench.fields.pattern-input.form')]
class PatternInputFieldForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form->schema([
            PatternInput::make('pattern', __('workbench.fields.pattern-input.title'))
                ->tokens([
                    PatternToken::make('NUMBER')
                        ->label(__('workbench.fields.pattern-input.number'))
                        ->configurable([
                            Choice::make('padding', __('workbench.fields.pattern-input.padding'))
                                ->options([4 => '4', 5 => '5', 6 => '6'])
                                ->value(4),
                        ]),
                    PatternToken::make('YYYY')->label(__('workbench.fields.pattern-input.year')),
                    PatternToken::make('MM')->label(__('workbench.fields.pattern-input.month')),
                    PatternToken::make('CUSTOMER_PREFIX')->label(__('workbench.fields.pattern-input.customer-prefix')),
                ])
                ->requiredTokens(['NUMBER'])
                ->separator('-'),
        ]);
    }

    public function handle(Request $request): Response
    {
        $this->validate($request);

        return redirect('/form/fields/pattern-input');
    }
}
