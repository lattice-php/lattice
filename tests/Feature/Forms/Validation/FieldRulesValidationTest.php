<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Lattice\Lattice\Forms\Components\Choice;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormDefinition;
use Symfony\Component\HttpFoundation\Response;

function stubDefinition(): FormDefinition
{
    return new class extends FormDefinition
    {
        public function definition(Form $form, Request $request): Form
        {
            return $form->schema([
                TextInput::make('name', 'Name')->rules(['required', 'string']),
                TextInput::make('price', 'Price')->rules(['required', 'numeric']),
            ]);
        }

        public function handle(Request $request): Response
        {
            return new Response('ok');
        }
    };
}

function emailDefinition(): FormDefinition
{
    return new class extends FormDefinition
    {
        public function definition(Form $form, Request $request): Form
        {
            return $form->schema([
                TextInput::make('email', 'Email')->email()->rules(['required']),
            ]);
        }

        public function handle(Request $request): Response
        {
            return new Response('ok');
        }
    };
}

function conditionalDefinition(): FormDefinition
{
    return new class extends FormDefinition
    {
        public function definition(Form $form, Request $request): Form
        {
            return $form->schema([
                Choice::make('type', 'Type')->options([
                    Choice::option('Personal', 'personal'),
                    Choice::option('Business', 'business'),
                ]),
                TextInput::make('company', 'Company')
                    ->dependsOn('type', 'business')
                    ->requiredWhen('type', 'business')
                    ->rules(['string']),
            ]);
        }

        public function handle(Request $request): Response
        {
            return new Response('ok');
        }
    };
}

it('derives validation rules from fields and fails an empty payload', function (): void {
    $definition = stubDefinition();

    expect(fn (): array => $definition->validate(Request::create('/', 'POST', [])))
        ->toThrow(ValidationException::class);
});

it('passes validation with a valid payload', function (): void {
    $definition = stubDefinition();

    $validated = $definition->validate(Request::create('/', 'POST', [
        'name' => 'Desk Lamp',
        'price' => '49.99',
    ]));

    expect($validated)->toMatchArray(['name' => 'Desk Lamp', 'price' => '49.99']);
});

it('rejects a non-fully-qualified email when email() is used', function (): void {
    expect(fn (): array => emailDefinition()->validate(Request::create('/', 'POST', ['email' => 'a@a'])))
        ->toThrow(ValidationException::class);
});

it('accepts a proper email when email() is used', function (): void {
    $validated = emailDefinition()->validate(Request::create('/', 'POST', ['email' => 'ada@example.com']));

    expect($validated)->toMatchArray(['email' => 'ada@example.com']);
});

it('skips hidden field rules', function (): void {
    $validated = conditionalDefinition()->validate(Request::create('/', 'POST', ['type' => 'personal']));

    expect($validated)->not->toHaveKey('company');
});

it('requires the field when its condition matches', function (): void {
    expect(fn (): array => conditionalDefinition()->validate(Request::create('/', 'POST', ['type' => 'business'])))
        ->toThrow(ValidationException::class);
});

function choiceDefinition(bool $required = false): FormDefinition
{
    return new class($required) extends FormDefinition
    {
        public function __construct(private readonly bool $required) {}

        public function definition(Form $form, Request $request): Form
        {
            $role = Choice::make('role', 'Role')->options([
                Choice::option('Member', 'member'),
                Choice::option('Admin', 'admin'),
            ]);

            return $form->schema([$this->required ? $role->required() : $role]);
        }

        public function handle(Request $request): Response
        {
            return new Response('ok');
        }
    };
}

it('rejects a choice value outside its options', function (): void {
    expect(fn (): array => choiceDefinition()->validate(Request::create('/', 'POST', ['role' => 'owner'])))
        ->toThrow(ValidationException::class);
});

it('accepts a choice value within its options', function (): void {
    $validated = choiceDefinition()->validate(Request::create('/', 'POST', ['role' => 'admin']));

    expect($validated)->toMatchArray(['role' => 'admin']);
});

it('allows an optional choice to be omitted', function (): void {
    expect(fn (): array => choiceDefinition()->validate(Request::create('/', 'POST', [])))
        ->not->toThrow(ValidationException::class);
});

it('still requires a choice marked required', function (): void {
    expect(fn (): array => choiceDefinition(required: true)->validate(Request::create('/', 'POST', [])))
        ->toThrow(ValidationException::class);
});
