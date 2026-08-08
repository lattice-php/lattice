<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Actions\BulkActionRegistry;
use Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Core\Facades\Lattice;
use Lattice\Core\Services\ComponentReferenceSigner;
use Lattice\Form\Components\Form;
use Lattice\Fragments\Components\Fragment as FragmentComponent;
use Lattice\Table\Components\Table;
use Lattice\Tests\Fixtures\Discovery\DiscoveredArchiveBulkAction;
use Lattice\Tests\Fixtures\Discovery\DiscoveredPanelFragment;
use Lattice\Tests\Fixtures\Discovery\DiscoveredPingAction;
use Lattice\Tests\Fixtures\Discovery\DiscoveredProfileForm;
use Lattice\Tests\Fixtures\Discovery\DiscoveredUsersTable;

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
                'ref' => $this->latticeRef($form),
                'submitLabel' => null,
                'validationSummaryLabel' => 'Fix these fields to continue:',
                'precognitive' => false,
                'validationTimeout' => null,
                'submitButton' => true,
                'submitJustify' => null,
                'submitVariant' => null,
                'submitEmphasis' => null,
                'submitButtons' => null,
                'resetOnSuccess' => null,
                'resetOnError' => null,
                'status' => null,
                'state' => [],
                'fullWidth' => false,
            ],
        ])
        ->and($table)
        ->toMatchArray([
            'type' => 'table',
            'id' => 'fixtures.users',
        ])
        ->and($table['props']['endpoint'])->toBe('/lattice/tables/fixtures.users')
        ->and($table['props']['ref'])->toBe($this->latticeRef($table))
        ->and($action)
        ->toMatchArray([
            'type' => 'action',
            'id' => 'fixtures.ping',
            'props' => [
                'endpoint' => '/lattice/actions/fixtures.ping',
                'label' => 'Ping',
                'method' => 'post',
                'ref' => $this->latticeRef($action),
                'icon' => null,
                'confirmation' => null,
                'form' => null,
                'lazyForm' => false,
                'modalSide' => null,
                'modalWidth' => null,
                'variant' => null,
                'emphasis' => null,
            ],
        ])
        ->and($fragment)
        ->toMatchArray([
            'type' => 'fragment',
            'id' => 'fixtures.panel',
            'props' => [
                'endpoint' => '/lattice/fragments/fixtures.panel',
                'lazy' => true,
                'ref' => $this->latticeRef($fragment),
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

    postJson('/lattice/actions/workbench.missing', [], $this->latticeHeaders($refs['action']))
        ->assertNotFound();
    patch('/lattice/forms/workbench.missing', [], $this->latticeHeaders($refs['form']))
        ->assertNotFound();
    $this->latticeGet('/lattice/tables/workbench.missing', $refs['table'])
        ->assertNotFound();
    $this->latticeGet('/lattice/fragments/workbench.missing', $refs['fragment'])
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

    postJson('/lattice/actions/workbench.denied', [], $this->latticeHeaders($refs['action']))
        ->assertForbidden();
    patch('/lattice/forms/workbench.denied', [], $this->latticeHeaders($refs['form']))
        ->assertForbidden();
    $this->latticeGet('/lattice/tables/workbench.denied', $refs['table'])
        ->assertForbidden();
    $this->latticeGet('/lattice/fragments/workbench.denied', $refs['fragment'])
        ->assertForbidden();
});

use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Core\Attributes\AsAction;
use Lattice\Core\Attributes\AsFragment;
use Lattice\Form\Attributes\AsForm;
use Lattice\Form\FormDefinition;
use Lattice\Fragments\FragmentDefinition;
use Lattice\Table\Attributes\AsTable;
use Lattice\Table\CallbackTableSource;
use Lattice\Table\Columns\TextColumn;
use Lattice\Table\Contracts\TableSource;
use Lattice\Table\TableDefinition;
use Lattice\Table\TableQuery;
use Lattice\Table\TableResult;
use Lattice\Ui\Components\Text;
use Lattice\Ui\PageSchema;
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
