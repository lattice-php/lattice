<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Core\Attributes\AsAction;
use Lattice\Core\Concerns\ResolvesContextModels;
use Lattice\Core\Facades\Lattice;
use Lattice\Http\Page;
use Lattice\Tests\Fixtures\Workbench\WorkbenchContextModelAction;
use Lattice\Ui\PageSchema;
use Workbench\App\Models\Product;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

beforeEach(function (): void {
    Lattice::actions([WorkbenchContextModelAction::class]);
});

test('context models resolve by primary key and by an explicit column', function (): void {
    $byKey = Product::factory()->create(['name' => 'Keyed Product', 'sku' => 'KEYED-1']);
    $bySku = Product::factory()->create(['name' => 'Skued Product', 'sku' => 'SKUED-1']);

    $this->callAction(WorkbenchContextModelAction::class, [], [
        'product_id' => $byKey->getKey(),
        'sku' => 'SKUED-1',
    ])
        ->assertOk()
        ->assertJsonPath('data.byKey', 'Keyed Product')
        ->assertJsonPath('data.bySku', 'Skued Product')
        ->assertJsonPath('data.optional', null);
});

test('a strict context model aborts when the record does not exist', function (): void {
    Product::factory()->create(['name' => 'Skued Product', 'sku' => 'SKUED-1']);

    $this->callAction(WorkbenchContextModelAction::class, [], [
        'product_id' => 99999,
        'sku' => 'SKUED-1',
    ])
        ->assertNotFound();
});

test('a strict context model aborts when the key is absent', function (): void {
    Product::factory()->create(['name' => 'Skued Product', 'sku' => 'SKUED-1']);

    $this->callAction(WorkbenchContextModelAction::class, [], ['sku' => 'SKUED-1'])
        ->assertNotFound();
});

test('an OrNull accessor in a render-time authorize hides the component instead of aborting', function (): void {
    Lattice::actions([ContextGatedAction::class]);

    Route::get('context-gated', [ContextGatedPage::class, 'render'])
        ->middleware('web')
        ->name('context-gated.show');

    withoutVite();

    $response = get('/context-gated')->assertOk();

    $this->assertLatticePage($response)->assertNotRendered('action:workbench.context-gated');
});

#[AsAction('workbench.context-gated')]
class ContextGatedAction extends ActionDefinition
{
    use ResolvesContextModels;

    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Gated');
    }

    #[Override]
    public function authorize(Request $request): bool
    {
        return $this->contextModelOrNull('product_id', Product::class) instanceof Product;
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success(['ok' => true]);
    }
}

class ContextGatedPage extends Page
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(ActionComponent::use(ContextGatedAction::class));
    }
}
