<?php
declare(strict_types=1);

namespace Workbench\App\Forms;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Forms\Components\BlockEditor;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Ui\Components\Card;
use Symfony\Component\HttpFoundation\Response;
use Workbench\App\Blocks\ColumnsBlock;
use Workbench\App\Blocks\HeroBlock;

#[AsForm('workbench.block-editor.form')]
class BlockPageForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form
            ->precognitive(300)
            ->schema([
                Card::make(__('workbench.forms.block-editor.card'))->schema([
                    BlockEditor::make('content')
                        ->blocks([HeroBlock::class, ColumnsBlock::class])
                        ->addLabel(__('workbench.common.add-block')),
                ]),
            ]);
    }

    public function handle(Request $request): Response
    {
        $data = $this->validate($request);

        session()->flash('block-editor.saved', $data['content'] ?? []);

        return redirect('/block-editor');
    }
}
