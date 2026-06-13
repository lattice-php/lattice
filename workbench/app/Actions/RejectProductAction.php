<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Attributes\Action;
use Lattice\Lattice\Core\Enums\ButtonVariant;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\Enums\ToastVariant;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Forms\Components\Select;
use Lattice\Lattice\Forms\Components\Textarea;
use Workbench\App\Models\Product;

#[Action('workbench.products.reject')]
class RejectProductAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action
            ->label(__('workbench.actions.reject.label'))
            ->method(HttpMethod::Patch)
            ->variant(ButtonVariant::Destructive)
            ->confirm(__('workbench.actions.reject.confirmTitle'), __('workbench.actions.reject.confirmDescription'), __('workbench.actions.reject.confirmLabel'))
            ->form([
                Textarea::make('reason', __('workbench.common.reason'))->required()->rules(['string', 'max:255']),
                Select::make('replacement', __('workbench.actions.reject.suggestedReplacement'))
                    ->placeholder(__('workbench.common.searchProducts'))
                    ->searchable(fn (string $query): array => Product::query()
                        ->where('name', 'like', "%{$query}%")
                        ->orderBy('name')
                        ->limit(10)
                        ->get()
                        ->map(fn (Product $product): Option => Select::option($product->name, (string) $product->getKey()))
                        ->all())
                    ->rules(['nullable']),
            ]);
    }

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
            ->toast(ToastVariant::Success, __('workbench.actions.reject.toast', ['reason' => $data['reason']]))
            ->reloadComponent('workbench.products');
    }

    private function product(Request $request): Product
    {
        return Product::query()->findOrFail($this->context($request, 'product_id'));
    }
}
