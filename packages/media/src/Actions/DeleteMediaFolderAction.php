<?php
declare(strict_types=1);

namespace Lattice\Media\Actions;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action;
use Lattice\Core\Attributes\AsAction;
use Lattice\Media\Models\Media;
use Lattice\Media\Models\MediaFolder;
use Lattice\Ui\Enums\HttpMethod;
use Lattice\Ui\Enums\Variant;

/**
 * Deletes a folder without deleting anything inside it: its subfolders and its
 * media move up to the parent, so a mis-click never loses files.
 */
#[AsAction('media.folder.delete')]
final class DeleteMediaFolderAction extends ActionDefinition
{
    public function definition(Action $action): Action
    {
        return $action
            ->label(__('media::media.folders.delete.label'))
            ->method(HttpMethod::Delete)
            ->variant(Variant::Danger)
            ->confirm(
                __('media::media.folders.delete.confirm-title'),
                __('media::media.folders.delete.confirm-description'),
            );
    }

    #[\Override]
    public function authorize(Request $request): bool
    {
        return Gate::allows('delete', $this->folder());
    }

    public function handle(): ActionResult
    {
        $folder = $this->folder();
        $parentId = $folder->parent_id;

        DB::transaction(function () use ($folder, $parentId): void {
            MediaFolder::query()->where('parent_id', $folder->getKey())->update(['parent_id' => $parentId]);
            Media::modelQuery()->where('folder_id', $folder->getKey())->update(['folder_id' => $parentId]);

            $folder->delete();
        });

        return ActionResult::success(['id' => $folder->getKey()])
            ->toast(__('media::media.folders.delete.toast'), Variant::Success)
            ->reloadComponent('media.folders')
            ->reloadComponent('media.library');
    }

    private function folder(): MediaFolder
    {
        return MediaFolder::query()->findOrFail($this->contextInt('folder'));
    }
}
