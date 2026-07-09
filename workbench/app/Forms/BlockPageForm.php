<?php
declare(strict_types=1);

namespace Workbench\App\Forms;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Core\Components\Card;
use Lattice\Lattice\Forms\Components\BlockEditor;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\FormDefinition;
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
        $this->validate($request);

        // BlockEditor rows only validate fields with explicit rules (see
        // HandlesRowSchemas::rowRules), so an optional field like the hero's
        // "title" is absent from validate()'s output. Read the raw, already
        // structurally-validated payload back for display/persistence instead.
        session()->flash('block-editor.saved', $request->input('content', []));

        return redirect('/block-editor');
    }
}
