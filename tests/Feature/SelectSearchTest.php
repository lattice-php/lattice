<?php

declare(strict_types=1);

use Bambamboole\Lattice\Facades\Lattice;
use Bambamboole\Lattice\Forms\Components\Form;
use Bambamboole\Lattice\Forms\Components\Select;
use Bambamboole\Lattice\Forms\Components\TextInput;
use Bambamboole\Lattice\Forms\FormDefinition;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Workbench\App\Forms\ShowcaseForm;
use Workbench\App\Models\Product;

use function Pest\Laravel\post;

function searchableDefinition(): FormDefinition
{
    return new class extends FormDefinition
    {
        public function definition(Form $form, Request $request): Form
        {
            return $form->schema([
                TextInput::make('name', 'Name'),
                Select::make('plan', 'Plan')->options([Select::option('Free', 'free')]),
                Select::make('author_id', 'Author')
                    ->searchable(fn (string $query) => [
                        ['label' => "Match: {$query}", 'value' => '1'],
                        ['label' => 'Other', 'value' => '2'],
                    ]),
            ]);
        }

        public function handle(Request $request): Response
        {
            return new Response('ok');
        }
    };
}

it('resolves options for a searchable field', function (): void {
    $result = searchableDefinition()->searchOptions(
        Request::create('/', 'POST', ['_search' => 'author_id', 'q' => 'jane']),
    );

    expect($result)->toBe([
        'options' => [
            ['label' => 'Match: jane', 'value' => '1'],
            ['label' => 'Other', 'value' => '2'],
        ],
    ]);
});

it('aborts with 404 when the searched field does not exist', function (): void {
    searchableDefinition()->searchOptions(
        Request::create('/', 'POST', ['_search' => 'missing', 'q' => 'x']),
    );
})->throws(NotFoundHttpException::class);

it('aborts with 422 when the field is not searchable', function (): void {
    searchableDefinition()->searchOptions(
        Request::create('/', 'POST', ['_search' => 'plan', 'q' => 'x']),
    );
})->throws(HttpException::class);

it('searches options through the form endpoint with a signed reference', function (): void {
    Lattice::forms([ShowcaseForm::class]);

    Product::factory()->create(['name' => 'Walnut Desk']);
    Product::factory()->create(['name' => 'Steel Lamp']);

    $ref = Form::use(ShowcaseForm::class)->toArray()['props']['ref'];

    post('/lattice/forms/workbench.showcase.form', [
        '_search' => 'related_products',
        'q' => 'walnut',
    ], ['X-Lattice-Ref' => $ref])
        ->assertOk()
        ->assertExactJson([
            'options' => [
                ['label' => 'Walnut Desk', 'value' => (string) Product::query()->where('name', 'Walnut Desk')->value('id')],
            ],
        ]);
});
