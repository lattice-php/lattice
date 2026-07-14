<?php
declare(strict_types=1);

namespace Workbench\App\Forms\Fields;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\Components\RichEditor;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Forms\RichEditor\Extensions\Bold;
use Lattice\Lattice\Forms\RichEditor\Extensions\Italic;
use Lattice\Lattice\Forms\RichEditor\Extensions\Link;
use Lattice\Lattice\Ui\Components\Tab;
use Lattice\Lattice\Ui\Components\Tabs;
use Lattice\Lattice\Ui\Enums\Orientation;
use Symfony\Component\HttpFoundation\Response;

#[AsForm('workbench.fields.rich-editor.form')]
class RichEditorFieldForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form->schema([
            Tabs::make('rich-editor-variants')
                ->queryKey('type')
                ->orientation(Orientation::Vertical)
                ->defaultValue('default')
                ->schema([
                    Tab::make('default', __('workbench.fields.rich-editor.default'))->schema([
                        RichEditor::make('article', __('workbench.common.article')),
                    ]),
                    Tab::make('restricted', __('workbench.fields.rich-editor.restricted'))->schema([
                        RichEditor::make('summary', __('workbench.fields.rich-editor.summary'))
                            ->extensions([
                                Bold::make(),
                                Italic::make(),
                                Link::make()->protocols('https', 'mailto'),
                                'stamp',
                            ]),
                    ]),
                ]),
        ]);
    }

    public function handle(Request $request): Response
    {
        $this->validate($request);

        return redirect('/form/fields/rich-editor');
    }
}
