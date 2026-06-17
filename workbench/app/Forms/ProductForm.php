<?php
declare(strict_types=1);

namespace Workbench\App\Forms;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Core\Components\Card;
use Lattice\Lattice\Core\EloquentOptions;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Forms\Components\Choice;
use Lattice\Lattice\Forms\Components\FileUpload;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\Components\Repeater;
use Lattice\Lattice\Forms\Components\Select;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormDefinition;
use Symfony\Component\HttpFoundation\Response;
use Workbench\App\Models\File;
use Workbench\App\Models\Group;
use Workbench\App\Models\Product;
use Workbench\App\Models\SalesPrice;

#[AsForm('workbench.products.form')]
class ProductForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        $product = $this->product($request);

        return $form
            ->precognitive(2650)
            ->schema([
                Card::make(__('workbench.forms.product.card'))->schema([
                    TextInput::make('name', __('workbench.forms.product.fields.name'))
                        ->rules(['required', 'string', 'max:255']),
                    TextInput::make('sku', __('workbench.forms.product.fields.sku'))
                        ->rules(['required', 'string', 'max:255', Rule::unique(Product::class, 'sku')->ignore($product)]),
                    Choice::make('status', __('workbench.forms.product.fields.status'))
                        ->options([
                            Choice::option(__('workbench.forms.product.status.draft'), 'draft'),
                            Choice::option(__('workbench.forms.product.status.active'), 'active'),
                            Choice::option(__('workbench.forms.product.status.archived'), 'archived'),
                        ])
                        ->rules(['required', 'string', Rule::in(['draft', 'active', 'archived'])]),
                    $this->imageUploadField(),
                    Select::make('related_products', __('workbench.forms.product.fields.related-products'))
                        ->multiple()
                        ->placeholder(__('workbench.common.search-products'))
                        ->optionsFrom(
                            EloquentOptions::make(Product::class)
                                ->label('name')
                                ->limit(10)
                                ->scope(fn ($query) => $product instanceof Product
                                    ? $query->whereKeyNot($product->getKey())
                                    : $query),
                        )
                        ->rules(['nullable', 'array']),
                ]),
                Card::make(__('workbench.forms.product.sales-prices.card'))->schema([
                    Repeater::make('sales_prices', __('workbench.forms.product.sales-prices.label'))
                        ->schema([
                            Select::make('group_id', __('workbench.forms.product.sales-prices.group'))
                                ->options($this->groupOptions())
                                ->rules(['nullable']),
                            TextInput::make('amount', __('workbench.forms.product.sales-prices.amount'))
                                ->rules(['required', 'numeric', 'min:0']),
                        ])
                        ->addLabel(__('workbench.forms.product.sales-prices.add')),
                ]),
            ]);
    }

    public function handle(Request $request): Response
    {
        $product = $this->product($request);
        $validated = $this->validate($request);

        $relatedIds = $validated['related_products'] ?? [];
        $priceRows = $validated['sales_prices'] ?? [];
        $imageKeys = $this->uploadedImageKeys($validated['images'] ?? []);
        $removedImagePaths = FileUpload::removed($request, 'images');
        unset($validated['related_products'], $validated['sales_prices'], $validated['images']);

        DB::transaction(function () use ($product, $validated, $relatedIds, $priceRows, $imageKeys, $removedImagePaths): void {
            if (! $product instanceof Product) {
                $product = Product::query()->create($validated);
            } else {
                $product->update($validated);
            }

            $product->relatedProducts()->sync(
                Product::query()->whereIn('id', $relatedIds)->pluck('id')->all(),
            );

            $this->syncSalesPrices($product, $priceRows);
            $this->syncImages($product, $imageKeys, $removedImagePaths);
        });

        return redirect('/products');
    }

    /**
     * @return array<int, array{group_id: string, amount: string}>
     */
    public function salesPriceRows(Product $product): array
    {
        return $product->salesPrices()
            ->orderByRaw('group_id is null desc')
            ->orderBy('group_id')
            ->get()
            ->map(fn (SalesPrice $salesPrice): array => [
                'group_id' => $salesPrice->group_id !== null ? (string) $salesPrice->group_id : '',
                'amount' => $salesPrice->amount,
            ])
            ->all();
    }

    /**
     * @return list<string>
     */
    public function imagePaths(Product $product): array
    {
        return $product->images()->pluck('files.path')->all();
    }

    /**
     * @return list<string>
     */
    public function uploadedImageKeys(mixed $value): array
    {
        $values = is_array($value) ? $value : [$value];

        return array_values(array_unique(array_filter(
            $values,
            static fn (mixed $key): bool => is_string($key) && $key !== '',
        )));
    }

    /**
     * Validates the single-default invariant and replaces the product's sales prices.
     * Throws a ValidationException when more than one row has an empty/null group_id.
     *
     * @param  array<int, array{group_id?: string|null, amount: string}>  $priceRows
     *
     * @throws ValidationException
     */
    public function syncSalesPrices(Product $product, array $priceRows): void
    {
        $defaults = array_filter(
            $priceRows,
            static fn (array $row): bool => ($row['group_id'] ?? '') === '' || ($row['group_id'] ?? null) === null,
        );

        if (count($defaults) > 1) {
            throw ValidationException::withMessages([
                'sales_prices' => __('workbench.forms.product.sales-prices.single-default'),
            ]);
        }

        $product->salesPrices()->delete();

        foreach ($priceRows as $row) {
            $groupId = ($row['group_id'] ?? '') === '' ? null : (int) $row['group_id'];

            $product->salesPrices()->create([
                'group_id' => $groupId,
                'amount' => $row['amount'],
            ]);
        }
    }

    /**
     * @param  list<string>  $imageKeys
     * @param  list<string>  $removedPaths
     */
    public function syncImages(Product $product, array $imageKeys, array $removedPaths): void
    {
        $this->detachImages($product, $removedPaths);

        if ($imageKeys === []) {
            return;
        }

        $sortOrder = (int) DB::table('attachments')
            ->where('attachable_type', Product::class)
            ->where('attachable_id', $product->getKey())
            ->max('sort_order');

        $finalizedUploads = $this->imageUploadField()
            ->finalizeSignedUploads(
                $imageKeys,
                fn (string $key, array $metadata): string => $this->productImagePath($product, $metadata['extension']),
            );

        foreach ($finalizedUploads as $upload) {
            $file = File::query()->create([
                'disk' => $upload['disk'],
                'path' => $upload['path'],
                'name' => $upload['name'],
                'mime_type' => $upload['mime_type'],
                'size' => $upload['size'],
            ]);

            $product->images()->attach($file->getKey(), [
                'sort_order' => ++$sortOrder,
            ]);
        }
    }

    /**
     * @return array<int, Option>
     */
    private function groupOptions(): array
    {
        $options = [Select::option(__('workbench.forms.product.sales-prices.default-group'), '')];

        foreach (Group::query()->orderBy('name')->get() as $group) {
            $options[] = Select::option($group->name, (string) $group->getKey());
        }

        return $options;
    }

    private function imageUploadField(): FileUpload
    {
        return FileUpload::make('images', __('workbench.forms.product.fields.images'))
            ->image()
            ->multiple()
            ->maxFiles(8)
            ->maxSize(4096)
            ->disk('s3')
            ->signedUpload()
            ->helperText(__('workbench.forms.product.fields.images-help-text'));
    }

    /**
     * @param  list<string>  $removedPaths
     */
    private function detachImages(Product $product, array $removedPaths): void
    {
        if ($removedPaths === []) {
            return;
        }

        $files = $product->images()
            ->where('files.disk', $this->imageUploadField()->resolveDisk())
            ->whereIn('files.path', $removedPaths)
            ->get();

        foreach ($files as $file) {
            $product->images()->detach($file->getKey());
            $this->deleteOrphanedFile($file);
        }
    }

    private function deleteOrphanedFile(File $file): void
    {
        if (DB::table('attachments')->where('file_id', $file->getKey())->exists()) {
            return;
        }

        Storage::disk($file->disk)->delete($file->path);
        $file->delete();
    }

    private function productImagePath(Product $product, string $extension): string
    {
        $sku = Str::slug($product->sku);
        $basename = $sku !== '' ? $sku : 'product-'.$product->getKey();

        return 'workbench/products/'.$basename.'-'.Str::uuid()->toString()
            .($extension !== '' ? '.'.$extension : '');
    }

    private function product(Request $request): ?Product
    {
        $id = $this->context($request, 'product_id');

        if ($id === null || $id === '') {
            return null;
        }

        return Product::query()->findOrFail($id);
    }
}
