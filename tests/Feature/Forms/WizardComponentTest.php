<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\Components\Wizard;
use Lattice\Lattice\Forms\Components\WizardStep;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Ui\Components\Section;
use Lattice\Lattice\Ui\Components\Text;
use Symfony\Component\HttpFoundation\Response;

test('wizard steps serialize their identity and default the label from the name', function (): void {
    $step = wire(WizardStep::make('customer-details')->description('Who is this for?'));

    expect($step['type'])->toBe('wizard-step')
        ->and($step['props'])->toMatchArray([
            'name' => 'customer-details',
            'label' => 'Customer Details',
            'description' => 'Who is this for?',
        ])
        ->and($step['schema'] ?? [])->toBe([]);
});

test('wizard steps serialize an explicit label and their child schema', function (): void {
    $step = wire(WizardStep::make('customer', 'Customer info')->schema([
        TextInput::make('name', 'Name'),
    ]));

    expect($step['props'])->toMatchArray(['name' => 'customer', 'label' => 'Customer info'])
        ->and($step['schema'][0]['type'])->toBe('field.text-input');
});

test('wizards serialize their orientation and step schema', function (): void {
    $wizard = wire(Wizard::make([
        WizardStep::make('customer'),
        WizardStep::make('review'),
    ])->vertical());

    expect($wizard['type'])->toBe('wizard')
        ->and($wizard['props'])->toMatchArray(['orientation' => 'vertical'])
        ->and(array_column($wizard['schema'], 'type'))->toBe(['wizard-step', 'wizard-step']);
});

test('wizards reject children that are not wizard steps', function (): void {
    wire(Wizard::make()->schema([Text::make('Loose text')]));
})->throws(LogicException::class, 'Wizard children must be WizardStep components.');

test('a form with a wizard as its sole root child suppresses the default submit row', function (): void {
    Lattice::forms([WizardCheckoutTestForm::class]);

    $form = wire(Form::use(WizardCheckoutTestForm::class));

    expect($form['props']['submitButton'])->toBeFalse()
        ->and($form['schema'][0]['type'])->toBe('wizard');
});

test('a wizard beside sibling root components is rejected', function (): void {
    wire(Form::make('broken')->schema([
        Text::make('Intro'),
        Wizard::make([WizardStep::make('one')]),
    ]));
})->throws(LogicException::class, 'sole root child');

test('a wizard nested below the form root is rejected', function (): void {
    wire(Form::make('nested')->schema([
        Section::make('Wrapper')->schema([
            Wizard::make([WizardStep::make('one')]),
        ]),
    ]));
})->throws(LogicException::class, 'sole root child');

test('a wizard nested inside a wizard step is rejected', function (): void {
    wire(Form::make('inception')->schema([
        Wizard::make([
            WizardStep::make('outer')->schema([
                Wizard::make([WizardStep::make('inner')]),
            ]),
        ]),
    ]));
})->throws(LogicException::class, 'sole root child');

test('a render-gated sole-root wizard is valid placement and still suppresses the submit row', function (): void {
    $form = wire(Form::make('gated')->schema([
        Wizard::make([WizardStep::make('one')])->hidden(),
    ]));

    expect($form['props']['submitButton'])->toBeFalse()
        ->and($form['schema'] ?? [])->toBe([]);
});

#[AsForm('workbench.wizard-checkout')]
class WizardCheckoutTestForm extends FormDefinition
{
    public function definition(Form $form, Request $request): Form
    {
        return $form->schema([
            Wizard::make([
                WizardStep::make('customer')->schema([
                    TextInput::make('name', 'Name')->required(),
                    TextInput::make('email', 'Email')->rules(['required', 'email']),
                ]),
                WizardStep::make('address')->schema([
                    TextInput::make('street', 'Street')->required(),
                ]),
                WizardStep::make('review'),
            ]),
        ]);
    }

    public function handle(Request $request): Response
    {
        $request->session()->put('handled-wizard', $request->string('name')->toString());

        return response()->json(['handled' => true]);
    }
}
