<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Actions\BulkActionRegistry;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Core\Services\ComponentReferenceSigner;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Fragments\Components\Fragment as FragmentComponent;
use Lattice\Lattice\Tables\Components\Table;
use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredArchiveBulkAction;
use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredPanelFragment;
use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredPingAction;
use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredProfileForm;
use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredUsersTable;

use function Pest\Laravel\patch;
use function Pest\Laravel\postJson;

test('lattice can discover attributed definitions from a path and namespace', function (): void {
    discoverFixtures();

    $form = wire(Form::use(DiscoveredProfileForm::class));
    $table = wire(Table::use(DiscoveredUsersTable::class));
    $action = wire(ActionComponent::use(DiscoveredPingAction::class));
    $fragment = wire(FragmentComponent::lazy(DiscoveredPanelFragment::class));

    expect($form)
        ->toMatchArray([
            'type' => 'form',
            'id' => 'fixtures.profile',
            'props' => [
                'action' => '/lattice/forms/fixtures.profile',
                'errorBag' => 'fixtures_profile',
                'method' => 'patch',
                'ref' => componentRef($form),
                'submitLabel' => null,
                'validationSummaryLabel' => 'Fix these fields to continue:',
                'precognitive' => false,
                'validationTimeout' => null,
                'submitButton' => true,
                'resetOnSuccess' => null,
                'resetOnError' => null,
                'status' => null,
                'state' => [],
            ],
        ])
        ->and($table)
        ->toMatchArray([
            'type' => 'table',
            'id' => 'fixtures.users',
        ])
        ->and($table['props']['endpoint'])->toBe('/lattice/tables/fixtures.users')
        ->and($table['props']['ref'])->toBe(componentRef($table))
        ->and($action)
        ->toMatchArray([
            'type' => 'action',
            'id' => 'fixtures.ping',
            'props' => [
                'endpoint' => '/lattice/actions/fixtures.ping',
                'label' => 'Ping',
                'method' => 'post',
                'ref' => componentRef($action),
                'icon' => null,
                'confirmation' => null,
                'form' => null,
                'lazyForm' => false,
                'variant' => null,
            ],
        ])
        ->and($fragment)
        ->toMatchArray([
            'type' => 'fragment',
            'id' => 'fixtures.panel',
            'props' => [
                'endpoint' => '/lattice/fragments/fixtures.panel',
                'lazy' => true,
                'ref' => componentRef($fragment),
                'size' => 'md',
            ],
        ]);
});

test('lattice discovers attributed bulk action definitions', function (): void {
    discoverFixtures();

    expect(app(BulkActionRegistry::class)->resolve('fixtures.archive'))
        ->toBeInstanceOf(DiscoveredArchiveBulkAction::class);
});

test('interaction endpoints return 404 for unknown component ids', function (): void {
    $signer = app(ComponentReferenceSigner::class);
    $refs = [
        'action' => $signer->seal('action', 'workbench.missing', []),
        'form' => $signer->seal('form', 'workbench.missing', []),
        'table' => $signer->seal('table', 'workbench.missing', []),
        'fragment' => $signer->seal('fragment', 'workbench.missing', []),
    ];

    postJson('/lattice/actions/workbench.missing', [], latticeHeaders($refs['action']))
        ->assertNotFound();
    patch('/lattice/forms/workbench.missing', [], latticeHeaders($refs['form']))
        ->assertNotFound();
    latticeGet('/lattice/tables/workbench.missing', $refs['table'])
        ->assertNotFound();
    latticeGet('/lattice/fragments/workbench.missing', $refs['fragment'])
        ->assertNotFound();
});

test('interaction endpoints re-run authorization for every interaction', function (): void {
    Lattice::actions([WorkbenchDeniedAction::class]);
    Lattice::forms([WorkbenchDeniedForm::class]);
    Lattice::tables([WorkbenchDeniedTable::class]);
    Lattice::fragments([WorkbenchDeniedFragment::class]);

    $signer = app(ComponentReferenceSigner::class);
    $refs = [
        'action' => $signer->seal('action', 'workbench.denied', []),
        'form' => $signer->seal('form', 'workbench.denied', []),
        'table' => $signer->seal('table', 'workbench.denied', []),
        'fragment' => $signer->seal('fragment', 'workbench.denied', []),
    ];

    postJson('/lattice/actions/workbench.denied', [], latticeHeaders($refs['action']))
        ->assertForbidden();
    patch('/lattice/forms/workbench.denied', [], latticeHeaders($refs['form']))
        ->assertForbidden();
    latticeGet('/lattice/tables/workbench.denied', $refs['table'])
        ->assertForbidden();
    latticeGet('/lattice/fragments/workbench.denied', $refs['fragment'])
        ->assertForbidden();
});

use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Attributes\AsAction;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Attributes\AsFragment;
use Lattice\Lattice\Attributes\AsTable;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Fragments\FragmentDefinition;
use Lattice\Lattice\Tables\CallbackTableSource;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\Contracts\TableSource;
use Lattice\Lattice\Tables\TableDefinition;
use Lattice\Lattice\Tables\TableQuery;
use Lattice\Lattice\Tables\TableResult;
use Lattice\Lattice\Ui\Components\Text;
use Symfony\Component\HttpFoundation\Response;

#[AsAction('workbench.denied')]
final class WorkbenchDeniedAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Denied');
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success();
    }

    #[Override]
    public function authorize(Request $request): bool
    {
        return false;
    }
}

#[AsForm('workbench.denied')]
final class WorkbenchDeniedForm extends FormDefinition
{
    public function definition(Form $form, Request $request): Form
    {
        return $form;
    }

    public function handle(Request $request): Response
    {
        return new Response;
    }

    #[Override]
    public function authorize(Request $request): bool
    {
        return false;
    }
}

#[AsTable('workbench.denied')]
final class WorkbenchDeniedTable extends TableDefinition
{
    public function columns(): array
    {
        return [TextColumn::make('name')];
    }

    public function source(): TableSource
    {
        return new CallbackTableSource(fn (TableQuery $query): TableResult => TableResult::make([]));
    }

    #[Override]
    public function authorize(Request $request): bool
    {
        return false;
    }
}

#[AsFragment('workbench.denied')]
final class WorkbenchDeniedFragment extends FragmentDefinition
{
    public function schema(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Denied fragment'));
    }

    #[Override]
    public function authorize(Request $request): bool
    {
        return false;
    }
}
