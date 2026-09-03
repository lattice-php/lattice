<?php
declare(strict_types=1);

namespace Lattice\Media\Actions;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action;
use Lattice\Actions\FormActionDefinition;
use Lattice\Core\Attributes\AsAction;
use Lattice\Form\Components\Form;
use Lattice\Form\Components\TextInput;
use Lattice\Form\FormData;
use Lattice\Media\Models\MediaFolder;
use Lattice\Ui\Enums\HttpMethod;
use Lattice\Ui\Enums\Variant;

/** Renames the folder sealed into this action's context. */
#[AsAction('media.folder.update')]
final class UpdateMediaFolderAction extends FormActionDefinition
{
    public function definition(Action $action): Action
    {
        return $action
            ->label(__('media::media.folders.rename.label'))
            ->method(HttpMethod::Patch);
    }

    #[\Override]
    public function authorize(Request $request): bool
    {
        return Gate::allows('update', $this->folder());
    }

    public function formSchema(Form $form, Request $request): Form
    {
        return $form->schema([
            TextInput::make('name', __('media::media.folders.name'))
                ->value($this->folder()->name)
                ->rules(['required', 'string', 'max:255']),
        ]);
    }

    public function handle(FormData $data): ActionResult
    {
        $folder = $this->folder();
        $folder->update(['name' => (string) $data->get('name')]);

        return ActionResult::success(['id' => $folder->getKey()])
            ->toast(__('media::media.folders.rename.toast'), Variant::Success)
            ->reloadComponent('media.folders');
    }

    private function folder(): MediaFolder
    {
        return MediaFolder::query()->findOrFail($this->contextInt('folder'));
    }
}
