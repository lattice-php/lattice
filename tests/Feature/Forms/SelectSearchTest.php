<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Forms\Components\Block;
use Lattice\Lattice\Forms\Components\Builder;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\Repeater;
use Lattice\Lattice\Forms\Components\Select;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Forms\FormDefinition;
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

function rowSearchDefinition(): FormDefinition
{
    return new class extends FormDefinition
    {
        public function definition(Form $form, Request $request): Form
        {
            $resolver = fn (string $query, FormData $data) => [
                Select::option(
                    "{$data->get('customer')}:{$data->get('category')}:{$query}",
                    '1',
                ),
            ];

            return $form->schema([
                TextInput::make('customer'),
                Repeater::make('items')->schema([
                    TextInput::make('category'),
                    Select::make('plan')->options([Select::option('Free', 'free')]),
                    Select::make('product')->searchable($resolver),
                ]),
                Builder::make('blocks')->blocks([
                    Block::make('product')->schema([
                        TextInput::make('category'),
                        Select::make('product')->searchable($resolver),
                    ]),
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

    expect($result)->toEqual([
        'options' => [
            new Option('Match: jane', '1'),
            new Option('Other', '2'),
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

it('resolves options for a searchable select inside a repeater row', function (): void {
    $result = rowSearchDefinition()->searchOptions(
        Request::create('/', 'POST', [
            '_search' => 'items.0.product',
            'q' => 'desk',
            'customer' => 'acme',
            'items' => [
                ['category' => 'chairs'],
            ],
        ]),
    );

    expect($result)->toEqual([
        'options' => [
            new Option('acme:chairs:desk', '1'),
        ],
    ]);
});

it('resolves options for a searchable select inside a builder row', function (): void {
    $result = rowSearchDefinition()->searchOptions(
        Request::create('/', 'POST', [
            '_search' => 'blocks.0.product',
            'q' => 'lamp',
            'customer' => 'initech',
            'blocks' => [
                ['type' => 'product', 'category' => 'lighting'],
            ],
        ]),
    );

    expect($result)->toEqual([
        'options' => [
            new Option('initech:lighting:lamp', '1'),
        ],
    ]);
});

it('aborts with 422 when a row select is not searchable', function (): void {
    $status = null;

    try {
        rowSearchDefinition()->searchOptions(
            Request::create('/', 'POST', [
                '_search' => 'items.0.plan',
                'q' => 'free',
                'items' => [
                    ['category' => 'chairs'],
                ],
            ]),
        );
    } catch (HttpException $exception) {
        $status = $exception->getStatusCode();
    }

    expect($status)->toBe(Response::HTTP_UNPROCESSABLE_ENTITY);
});

it('searches options through the form endpoint with a signed reference', function (): void {
    Lattice::forms([ShowcaseForm::class]);

    Product::factory()->create(['name' => 'Walnut Desk']);
    Product::factory()->create(['name' => 'Steel Lamp']);

    $ref = wire(Form::use(ShowcaseForm::class))['props']['ref'];

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
