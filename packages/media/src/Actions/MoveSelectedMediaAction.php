<?php
declare(strict_types=1);

namespace Lattice\Media\Actions;

use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;
use Lattice\Actions\ActionResult;
use Lattice\Actions\BulkActionDefinition;
use Lattice\Actions\Components\Action;
use Lattice\Core\Attributes\AsBulkAction;
use Lattice\Form\Components\Form;
use Lattice\Form\Components\Select;
use Lattice\Form\FormData;
use Lattice\Media\Models\Media;
use Lattice\Media\Support\FolderOptions;
use Lattice\Ui\Enums\HttpMethod;
use Lattice\Ui\Enums\Variant;

/** Files the selected media into a folder — or out of every folder. */
#[AsBulkAction('media.move-selected')]
final class MoveSelectedMediaAction extends BulkActionDefinition
{
    public function definition(Action $action): Action
    {
        return $action
            ->label(__('media::media.folders.move-media.label'))
            ->method(HttpMethod::Patch);
    }

    #[\Override]
    public function resolveFormSchema(Request $request): Form
    {
        return Form::make('form')->schema([
            Select::make('folder_id', __('media::media.folders.move-media.target'))
                ->options([
                    Select::option(__('media::media.folders.none'), ''),
                    ...FolderOptions::all(),
                ])
                ->rules(['nullable', 'integer', 'exists:media_folders,id']),
        ]);
    }

    /**
     * @param  Collection<int, mixed>  $records
     */
    public function handle(Collection $records, FormData $data): ActionResult
    {
        $folderId = $data->filled('folder_id') ? (int) $data->get('folder_id') : null;
        $moved = 0;

        $records->each(function (mixed $media) use ($folderId, &$moved): void {
            if ($media instanceof Media && Gate::allows('update', $media)) {
                $media->update(['folder_id' => $folderId]);
                $moved++;
            }
        });

        return ActionResult::success(['moved' => $moved])
            ->toast(__('media::media.folders.move-media.toast', ['count' => $moved]), Variant::Success)
            ->reloadComponent('media.library')
            ->reloadComponent('media.folders');
    }
}
