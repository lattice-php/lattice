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
use Lattice\Media\Models\Media;
use Lattice\Ui\Enums\HttpMethod;
use Lattice\Ui\Enums\Variant;

#[AsAction('media.update')]
final class UpdateMediaAction extends FormActionDefinition
{
    public function definition(Action $action): Action
    {
        return $action
            ->label(__('media::media.actions.update.label'))
            ->method(HttpMethod::Patch);
    }

    #[\Override]
    public function authorize(Request $request): bool
    {
        if (! $request->filled('media_id')) {
            return Gate::allows('viewAny', Media::modelClass());
        }

        return Gate::allows('update', $this->media($request));
    }

    public function formSchema(Form $form, Request $request): Form
    {
        return $form->schema([
            TextInput::make('name', __('media::media.columns.name'))->rules(['required', 'string', 'max:255']),
            TextInput::make('alt', __('media::media.columns.alt'))->rules(['nullable', 'string', 'max:255']),
        ]);
    }

    public function handle(Request $request): ActionResult
    {
        $media = $this->media($request);
        $data = $this->validate($request);

        $media->update(['name' => $data['name']]);
        $media->mergeMeta(['alt' => $data['alt'] ?? null]);

        return ActionResult::success(['id' => $media->getKey()])
            ->toast(__('media::media.actions.update.toast'), Variant::Success)
            ->reloadComponent('media.library');
    }

    private function media(Request $request): Media
    {
        return Media::modelQuery()->findOrFail($request->integer('media_id'));
    }
}
