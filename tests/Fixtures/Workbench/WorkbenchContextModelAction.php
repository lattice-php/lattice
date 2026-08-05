<?php
declare(strict_types=1);

namespace Lattice\Tests\Fixtures\Workbench;

use Illuminate\Http\Request;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Core\Attributes\AsAction;
use Lattice\Core\Concerns\ResolvesContextModels;
use Workbench\App\Models\Product;

#[AsAction('workbench.context-model-reader')]
class WorkbenchContextModelAction extends ActionDefinition
{
    use ResolvesContextModels;

    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Context model reader');
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success([
            'byKey' => $this->contextModel('product_id', Product::class)->name,
            'bySku' => $this->contextModel('sku', Product::class, by: 'sku')->name,
            'optional' => $this->contextModelOrNull('missing_id', Product::class)?->name,
        ]);
    }
}
