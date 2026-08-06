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
use Lattice\Media\Models\Media;
use Lattice\Ui\Enums\HttpMethod;
use Lattice\Ui\Enums\Variant;

#[AsBulkAction('media.delete-selected')]
final class DeleteSelectedMediaAction extends BulkActionDefinition
{
    public function definition(Action $action): Action
    {
        return $action
            ->label(__('media::media.actions.delete-selected.label'))
            ->method(HttpMethod::Delete)
            ->variant(Variant::Danger);
    }

    /**
     * @param  Collection<int, mixed>  $records
     */
    public function handle(Collection $records, Request $request): ActionResult
    {
        $deleted = 0;

        $records->each(function (mixed $media) use (&$deleted): void {
            if ($media instanceof Media && Gate::allows('delete', $media)) {
                $media->delete();
                $deleted++;
            }
        });

        return ActionResult::success(['deleted' => $deleted])
            ->toast(__('media::media.actions.delete-selected.toast', ['count' => $deleted]), Variant::Success)
            ->reloadComponent('media.library');
    }
}
