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
use Lattice\Form\Components\Select;
use Lattice\Form\Components\TextInput;
use Lattice\Form\FormData;
use Lattice\Media\Models\MediaFolder;
use Lattice\Media\Support\FolderOptions;
use Lattice\Ui\Enums\HttpMethod;
use Lattice\Ui\Enums\Variant;

/**
 * Creates a folder. A sealed `folder` context makes it the "new subfolder"
 * action of that node; without one the form asks where the folder belongs.
 */
#[AsAction('media.folder.create')]
final class CreateMediaFolderAction extends FormActionDefinition
{
    public function definition(Action $action): Action
    {
        return $action
            ->label(__('media::media.folders.create.label'))
            ->method(HttpMethod::Post);
    }

    #[\Override]
    public function authorize(Request $request): bool
    {
        return Gate::allows('create', MediaFolder::class);
    }

    public function formSchema(Form $form, Request $request): Form
    {
        $name = TextInput::make('name', __('media::media.folders.name'))
            ->rules(['required', 'string', 'max:255']);

        if ($this->parentId() !== null) {
            return $form->schema([$name]);
        }

        return $form->schema([
            $name,
            Select::make('parent_id', __('media::media.folders.parent'))
                ->options(FolderOptions::all())
                ->rules(['nullable', 'integer', 'exists:media_folders,id']),
        ]);
    }

    public function handle(FormData $data): ActionResult
    {
        $parent = $this->parentId() ?? ($data->filled('parent_id') ? (int) $data->get('parent_id') : null);

        $folder = MediaFolder::query()->create([
            'name' => (string) $data->get('name'),
            'parent_id' => $parent,
            'sort_order' => (int) MediaFolder::query()->where('parent_id', $parent)->max('sort_order') + 1,
        ]);

        return ActionResult::success(['id' => $folder->getKey()])
            ->toast(__('media::media.folders.create.toast'), Variant::Success)
            ->reloadComponent('media.folders');
    }

    private function parentId(): ?int
    {
        return $this->contextIntOrNull('folder');
    }
}
