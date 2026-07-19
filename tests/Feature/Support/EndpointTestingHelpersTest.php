<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Route;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\BulkActionDefinition;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Attributes\AsAction;
use Lattice\Lattice\Attributes\AsBulkAction;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Attributes\AsFragment;
use Lattice\Lattice\Attributes\AsTable;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Fragments\FragmentDefinition;
use Lattice\Lattice\Support\Testing\LatticeTestResponse;
use Lattice\Lattice\Tables\CallbackTableSource;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\Contracts\TableSource;
use Lattice\Lattice\Tables\TableDefinition;
use Lattice\Lattice\Tables\TableQuery;
use Lattice\Lattice\Tables\TableResult;
use Lattice\Lattice\Ui\Components\Text;
use Lattice\Lattice\Ui\Enums\HttpMethod;
use Lattice\Lattice\Ui\Enums\Variant;
use PHPUnit\Framework\AssertionFailedError;
use Symfony\Component\HttpFoundation\Response;

test('submitForm seals the ref and submits to the form endpoint with the declared method', function (): void {
    Lattice::forms([HelperDemoForm::class]);

    $response = $this->submitForm(HelperDemoForm::class, ['name' => 'Taylor'], ['team' => 'lattice-core']);

    $this->assertInstanceOf(LatticeTestResponse::class, $response);

    $response->assertRedirect('/submitted');

    expect(session('helper-demo-form'))->toBe('Taylor')
        ->and(session('helper-demo-team'))->toBe('lattice-core');
});

test('callAction seals the ref and posts to the action endpoint', function (): void {
    Lattice::actions([HelperDemoAction::class]);

    $response = $this->callAction(HelperDemoAction::class, ['name' => 'Taylor'], ['team' => 'trusted-team']);

    $this->assertInstanceOf(LatticeTestResponse::class, $response);

    $response->assertOk()
        ->assertJsonPath('data.handled', 'Taylor')
        ->assertJsonPath('data.team', 'trusted-team')
        ->assertNoEffects();
});

test('typed effect assertions match action response effects regardless of order', function (): void {
    Route::get('/helper/projects/{project}', fn (string $project): string => $project)
        ->name('helper.projects.show');
    Lattice::actions([HelperEffectsAction::class]);

    $response = $this->callAction(HelperEffectsAction::class);

    $response
        ->assertOk()
        ->assertReloadsComponent('profile.passkeys')
        ->assertRedirectsTo('/dashboard')
        ->assertRedirectsToRoute('helper.projects.show', 'lattice')
        ->assertToast(Variant::Success)
        ->assertToast(Variant::Success, 'Saved.')
        ->assertOpensModal('two-factor')
        ->assertReloadsPage();
});

test('typed effect assertion failures identify the expected and received effects', function (): void {
    Route::get('/helper/projects/{project}', fn (string $project): string => $project)
        ->name('helper.projects.show');
    Lattice::actions([HelperEffectsAction::class]);

    expect(fn () => $this->callAction(HelperEffectsAction::class)
        ->assertReloadsComponent('billing.summary'))
        ->toThrow(
            AssertionFailedError::class,
            'Expected Lattice effect [reload-component] with props {"component":"billing.summary"}. Received effects:',
        );
});

test('assertNoEffects failures include the received effects', function (): void {
    Route::get('/helper/projects/{project}', fn (string $project): string => $project)
        ->name('helper.projects.show');
    Lattice::actions([HelperEffectsAction::class]);

    expect(fn () => $this->callAction(HelperEffectsAction::class)->assertNoEffects())
        ->toThrow(AssertionFailedError::class, 'Expected no Lattice effects. Received effects:');
});

test('callBulkAction seals the ref against the bound table and patches the endpoint', function (): void {
    Lattice::tables([HelperDemoTable::class]);
    Lattice::bulkActions([HelperDemoBulkAction::class]);

    $response = $this->callBulkAction(
        HelperDemoBulkAction::class,
        ['selected' => [1, 2]],
        ['table' => 'helper.demo'],
    );

    $this->assertInstanceOf(LatticeTestResponse::class, $response);

    $response->assertOk()
        ->assertJsonPath('data.count', 2);
});

test('loadTable seals the ref and gets the table endpoint with query parameters', function (): void {
    Lattice::tables([HelperDemoTable::class]);

    $response = $this->loadTable(HelperDemoTable::class, ['per_page' => 10]);

    $this->assertInstanceOf(LatticeTestResponse::class, $response);

    $response->assertOk()
        ->assertJsonPath('data.0.name', 'Ada')
        ->assertJsonPath('query.perPage', 10);
});

test('submitForm followed by callAction in the same test both succeed', function (): void {
    Lattice::forms([HelperDemoForm::class]);
    Lattice::actions([HelperDemoAction::class]);

    $this->submitForm(HelperDemoForm::class, ['name' => 'Taylor'], ['team' => 'lattice-core'])
        ->assertRedirect('/submitted');

    $this->callAction(HelperDemoAction::class, ['name' => 'Ada'], ['team' => 'trusted-team'])
        ->assertOk()
        ->assertJsonPath('data.handled', 'Ada')
        ->assertJsonPath('data.team', 'trusted-team');
});

test('loadFragment seals the ref and gets the lazy fragment endpoint', function (): void {
    Lattice::fragments([HelperDemoFragment::class]);

    $response = $this->loadFragment(HelperDemoFragment::class);

    $this->assertInstanceOf(LatticeTestResponse::class, $response);

    $response->assertOk()
        ->assertJsonPath('schema.0.type', 'text')
        ->assertJsonPath('schema.0.props.text', 'Fragment loaded.');
});

test('latticeGet sends a signed component reference header', function (): void {
    Route::get('/helper/lattice-ref', fn (Request $request): array => [
        'ref' => $request->header('X-Lattice-Ref'),
    ]);

    $this->latticeGet('/helper/lattice-ref', 'signed-ref')
        ->assertOk()
        ->assertJsonPath('ref', 'signed-ref');
});

#[AsForm('helper.demo')]
class HelperDemoForm extends FormDefinition
{
    public function definition(Form $form, Request $request): Form
    {
        return $form
            ->method(HttpMethod::Patch)
            ->schema([Text::make('Helper demo form')])
            ->withoutSubmitButton();
    }

    public function handle(Request $request): Response
    {
        $request->session()->put('helper-demo-form', $request->string('name')->toString());
        $request->session()->put('helper-demo-team', $this->context('team'));

        return redirect('/submitted');
    }
}

#[AsAction('helper.demo')]
class HelperDemoAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Helper demo')->method(HttpMethod::Post);
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success([
            'handled' => $request->string('name')->toString(),
            'team' => $this->context('team'),
        ]);
    }
}

#[AsBulkAction('helper.demo')]
class HelperDemoBulkAction extends BulkActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Archive selected')->method(HttpMethod::Patch);
    }

    /**
     * @param  Collection<int, mixed>  $records
     */
    public function handle(Collection $records, Request $request): ActionResult
    {
        return ActionResult::success(['count' => $records->count()]);
    }
}

#[AsTable('helper.demo')]
class HelperDemoTable extends TableDefinition
{
    public function columns(): array
    {
        return [TextColumn::make('name')->label('Name')];
    }

    public function source(): TableSource
    {
        return new CallbackTableSource(
            query: fn (TableQuery $query): TableResult => TableResult::make([
                ['id' => 1, 'name' => 'Ada'],
                ['id' => 2, 'name' => 'Grace'],
            ]),
            selection: fn (array $keys): Collection => collect($keys),
        );
    }
}

#[AsFragment('helper.demo')]
final class HelperDemoFragment extends FragmentDefinition
{
    public function schema(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Fragment loaded.'));
    }
}

#[AsAction('helper.effects')]
final class HelperEffectsAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Effects');
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success()
            ->openModal('two-factor')
            ->toast('Saved.', Variant::Success)
            ->to('/dashboard')
            ->reloadPage()
            ->toRoute('helper.projects.show', 'lattice')
            ->reloadComponent('profile.passkeys');
    }
}
