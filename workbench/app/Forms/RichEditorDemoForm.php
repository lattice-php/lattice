<?php
declare(strict_types=1);

namespace Workbench\App\Forms;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\Components\RichEditor;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Forms\RichEditor\Extensions\Bold;
use Lattice\Lattice\Forms\RichEditor\Extensions\Italic;
use Lattice\Lattice\Forms\RichEditor\Extensions\Link;
use Lattice\Lattice\Ui\Components\Card;
use Symfony\Component\HttpFoundation\Response;

#[AsForm('workbench.rich-editor-demo.form')]
class RichEditorDemoForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form->schema([
            Card::make('Reduced toolbar')->schema([
                RichEditor::make('article', __('workbench.common.article'))
                    ->extensions([
                        Bold::make(),
                        Italic::make(),
                        Link::make()->protocols('https', 'mailto'),
                        'stamp',
                    ]),
            ]),
        ]);
    }

    public function handle(Request $request): Response
    {
        $this->validate($request);

        return redirect('/rich-editor-demo');
    }
}
