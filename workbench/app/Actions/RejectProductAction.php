<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Attributes\AsAction;
use Lattice\Lattice\Core\Enums\ButtonVariant;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\Enums\Variant;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Forms\Components\Select;
use Lattice\Lattice\Forms\Components\Textarea;
use Workbench\App\Models\Product;

#[AsAction('workbench.products.reject')]
class RejectProductAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action
            ->label(__('workbench.actions.reject.label'))
            ->method(HttpMethod::Patch)
            ->variant(ButtonVariant::Destructive)
            ->confirm(__('workbench.actions.reject.confirm-title'), __('workbench.actions.reject.confirm-description'), __('workbench.actions.reject.confirm-label'))
            ->form([
                Textarea::make('reason', __('workbench.common.reason'))->required()->rules(['string', 'max:255']),
                Select::make('replacement', __('workbench.actions.reject.suggested-replacement'))
                    ->placeholder(__('workbench.common.search-products'))
                    ->searchable(fn (string $search): array => Product::query()
                        ->where('name', 'like', "%{$search}%")
                        ->orderBy('name')
                        ->limit(10)
                        ->get()
                        ->map(fn (Product $product): Option => Select::option($product->name, (string) $product->getKey()))
                        ->all())
                    ->rules(['nullable']),
            ]);
    }

    #[\Override]
    public function authorize(Request $request): bool
    {
        return $this->product($request)->status !== 'archived';
    }

    public function handle(Request $request): ActionResult
    {
        $data = $this->validate($request);

        $product = $this->product($request);
        $product->update(['status' => 'archived']);

        return ActionResult::success(['id' => $product->getKey(), 'reason' => $data['reason']])
            ->toast(Variant::Success, __('workbench.actions.reject.toast', ['reason' => $data['reason']]))
            ->reloadComponent('workbench.products');
    }

    private function product(Request $request): Product
    {
        return Product::query()->findOrFail($this->context('product_id'));
    }
}
