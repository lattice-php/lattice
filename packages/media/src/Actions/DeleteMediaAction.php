<?php
declare(strict_types=1);

namespace Lattice\Media\Actions;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action;
use Lattice\Core\Attributes\AsAction;
use Lattice\Media\Models\Media;
use Lattice\Ui\Enums\HttpMethod;
use Lattice\Ui\Enums\Variant;

#[AsAction('media.delete')]
final class DeleteMediaAction extends ActionDefinition
{
    public function definition(Action $action): Action
    {
        return $action
            ->label(__('media::media.actions.delete.label'))
            ->method(HttpMethod::Delete)
            ->variant(Variant::Danger);
    }

    #[\Override]
    public function authorize(Request $request): bool
    {
        if (! $request->filled('media_id')) {
            return Gate::allows('viewAny', Media::modelClass());
        }

        return Gate::allows('delete', $this->media($request));
    }

    public function handle(Request $request): ActionResult
    {
        $this->media($request)->delete();

        return ActionResult::success()
            ->toast(__('media::media.actions.delete.toast'), Variant::Success)
            ->reloadComponent('media.library');
    }

    private function media(Request $request): Media
    {
        return Media::modelQuery()->findOrFail($request->integer('media_id'));
    }
}
