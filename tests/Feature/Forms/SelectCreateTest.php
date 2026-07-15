<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\Select;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormDefinition;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

function creatableDefinition(): FormDefinition
{
    return new class extends FormDefinition
    {
        public function definition(Form $form, Request $request): Form
        {
            return $form->schema([
                TextInput::make('name', 'Name'),
                Select::make('keywords', 'Keywords')->multiple()->creatable(),
                Select::make('tags', 'Tags')->multiple()
                    ->creatable(fn (string $label): Option => new Option($label, strtolower($label), ['color' => '#22c55e'])),
            ]);
        }

        public function handle(Request $request): Response
        {
            return new Response('ok');
        }
    };
}

it('resolves a created option for a server-creatable field', function (): void {
    $result = creatableDefinition()->createOption(
        Request::create('/', 'POST', ['_create' => 'tags', 'q' => 'Steel']),
    );

    expect($result)->toEqual(['option' => new Option('Steel', 'steel', ['color' => '#22c55e'])]);
});

it('aborts with 404 when the created field does not exist', function (): void {
    creatableDefinition()->createOption(
        Request::create('/', 'POST', ['_create' => 'missing', 'q' => 'x']),
    );
})->throws(NotFoundHttpException::class);

it('aborts with 422 when the field only creates on save (no resolver)', function (): void {
    $status = null;

    try {
        creatableDefinition()->createOption(
            Request::create('/', 'POST', ['_create' => 'keywords', 'q' => 'x']),
        );
    } catch (HttpException $exception) {
        $status = $exception->getStatusCode();
    }

    expect($status)->toBe(Response::HTTP_UNPROCESSABLE_ENTITY);
});
