<?php
declare(strict_types=1);

namespace Workbench\App\Forms;

use Illuminate\Http\Request;
use Lattice\Form\Attributes\AsForm;
use Lattice\Form\Components\Form as FormComponent;
use Lattice\Form\Components\RichEditor;
use Lattice\Form\Components\TextInput;
use Lattice\Form\FormDefinition;
use Lattice\Media\Forms\Components\MediaPicker;
use Lattice\Media\Forms\RichEditor\MediaImage;
use Symfony\Component\HttpFoundation\Response;
use Workbench\App\Models\Product;

#[AsForm('workbench.products.media')]
class ProductMediaForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form->schema([
            MediaPicker::make('gallery', __('workbench.forms.product-media.fields.gallery'))
                ->multiple()
                ->attachmentFields([
                    TextInput::make('caption', __('workbench.forms.product-media.fields.caption')),
                ])
                ->helperText(__('workbench.forms.product-media.fields.gallery-help-text')),
            RichEditor::make('body', __('workbench.forms.product-media.fields.body'))
                ->withExtensions(MediaImage::make()),
        ]);
    }

    public function handle(Request $request): Response
    {
        $validated = $this->validate($request);

        $this->product()->syncMedia($validated['gallery'] ?? [], 'gallery');
        $this->product()->update(['body' => $validated['body'] ?? null]);
        $this->product()->syncMedia(MediaImage::idsIn($validated['body'] ?? null), 'content');

        return redirect('/media-picker');
    }

    private function product(): Product
    {
        return Product::query()->findOrFail($this->context('product_id'));
    }
}
