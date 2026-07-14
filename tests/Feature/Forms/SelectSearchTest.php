<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Forms\Components\Builder;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\Repeater;
use Lattice\Lattice\Forms\Components\RowTemplate;
use Lattice\Lattice\Forms\Components\Select;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Forms\FormDefinition;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Workbench\App\Forms\Fields\SelectFieldForm;
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
                    ->searchable(fn (string $search): array => [
                        ['label' => "Match: {$search}", 'value' => '1'],
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
            $resolver = fn (string $search, FormData $data): array => [
                Select::option(
                    "{$data->get('customer')}:{$data->get('category')}:{$search}",
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
                Builder::make('blocks')->templates([
                    RowTemplate::make('product')->schema([
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

function nestedRowSearchDefinition(): FormDefinition
{
    return new class extends FormDefinition
    {
        public function definition(Form $form, Request $request): Form
        {
            $resolver = fn (string $search, FormData $data): array => [
                Select::option(
                    "{$data->get('customer')}:{$data->get('section')}:{$data->get('category')}:{$search}",
                    '1',
                ),
            ];

            return $form->schema([
                TextInput::make('customer'),
                Repeater::make('sections')->schema([
                    TextInput::make('section'),
                    Repeater::make('items')->schema([
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

it('resolves options for a searchable select inside nested repeater rows', function (): void {
    $result = nestedRowSearchDefinition()->searchOptions(
        Request::create('/', 'POST', [
            '_search' => 'sections.0.items.0.product',
            'q' => 'desk',
            'customer' => 'acme',
            'sections' => [[
                'section' => 'office',
                'items' => [
                    ['category' => 'chairs'],
                ],
            ]],
        ]),
    );

    expect($result)->toEqual([
        'options' => [
            new Option('acme:office:chairs:desk', '1'),
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
    Lattice::forms([SelectFieldForm::class]);

    $walnutDesk = Product::factory()->create(['name' => 'Walnut Desk']);
    Product::factory()->create(['name' => 'Steel Lamp']);

    $ref = wire(Form::use(SelectFieldForm::class))['props']['ref'];

    post('/lattice/forms/workbench.fields.select.form', [
        '_search' => 'related_products',
        'q' => 'walnut',
    ], $this->latticeHeaders($ref))
        ->assertOk()
        ->assertExactJson([
            'options' => [
                [
                    'label' => 'Walnut Desk',
                    'value' => (string) $walnutDesk->id,
                    'data' => ['sku' => $walnutDesk->sku, 'status' => $walnutDesk->status],
                ],
            ],
        ]);
});
