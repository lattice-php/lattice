<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Core\Attributes\AsAction;
use Lattice\Core\Concerns\ResolvesContextModels;
use Lattice\Core\Option;
use Lattice\Form\Components\Select;
use Lattice\Form\Components\Textarea;
use Lattice\Form\FormData;
use Lattice\Ui\Enums\HttpMethod;
use Lattice\Ui\Enums\Variant;
use Workbench\App\Models\Product;

#[AsAction('workbench.products.reject')]
class RejectProductAction extends ActionDefinition
{
    use ResolvesContextModels;

    public function definition(ActionComponent $action): ActionComponent
    {
        return $action
            ->label(__('workbench.actions.reject.label'))
            ->method(HttpMethod::Patch)
            ->variant(Variant::Danger)
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
        return $this->product()->status !== 'archived';
    }

    public function handle(FormData $data): ActionResult
    {
        $product = $this->product();
        $product->update(['status' => 'archived']);

        return ActionResult::success(['id' => $product->getKey(), 'reason' => $data['reason']])
            ->toast(__('workbench.actions.reject.toast', ['reason' => $data['reason']]), Variant::Success)
            ->reloadComponent('workbench.products');
    }

    private function product(): Product
    {
        return $this->contextModel('product_id', Product::class);
    }
}
