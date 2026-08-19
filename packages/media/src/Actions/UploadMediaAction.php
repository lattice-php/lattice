<?php
declare(strict_types=1);

namespace Lattice\Media\Actions;

use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action;
use Lattice\Actions\FormActionDefinition;
use Lattice\Core\Attributes\AsAction;
use Lattice\Form\Components\FileUpload;
use Lattice\Form\Components\Form;
use Lattice\Form\FormData;
use Lattice\Media\Jobs\GenerateMediaConversions;
use Lattice\Media\Models\Media;
use Lattice\Ui\Enums\HttpMethod;
use Lattice\Ui\Enums\Variant;

#[AsAction('media.upload')]
final class UploadMediaAction extends FormActionDefinition
{
    public function definition(Action $action): Action
    {
        return $action
            ->label(__('media::media.actions.upload.label'))
            ->method(HttpMethod::Post);
    }

    #[\Override]
    public function authorize(Request $request): bool
    {
        return Gate::allows('create', Media::modelClass());
    }

    public function formSchema(Form $form, Request $request): Form
    {
        return $form->schema([$this->field()]);
    }

    /**
     * The per-file rules sealed by the library instance run in their own pass:
     * Laravel's file rules only accept a file instance, while the field's own
     * rule bag validates the `files` array. Signed uploads submit temporary
     * keys rather than files, so nothing is checked there — `dimensions` and
     * friends are multipart-only.
     */
    #[\Override]
    public function validate(Request $request): FormData
    {
        $validated = parent::validate($request);
        $rules = array_values(array_filter((array) $this->context('upload_rules', []), is_string(...)));

        if ($rules !== []) {
            Validator::make(['files' => Arr::wrap($request->file('files', []))], ['files.*' => $rules])->validate();
        }

        return $validated;
    }

    /**
     * The payload carries full display descriptors, not bare ids: an
     * upload-only picker selects the fresh rows straight from this response
     * without a follow-up fetch.
     */
    public function handle(FormData $data): ActionResult
    {
        $media = array_map(
            // A sync queue has already generated the conversions by now, on its
            // own instances — refresh so the descriptors see them.
            static fn (Media $item): array => [
                'id' => (int) $item->refresh()->getKey(),
                'name' => $item->name,
                'url' => $item->url(),
                'preview_url' => $item->previewUrl(),
                'mime_type' => $item->mime_type,
            ],
            $this->storeUploads($data->get('files', [])),
        );

        return ActionResult::success(['media' => $media])
            ->toast(__('media::media.actions.upload.toast', ['count' => count($media)]), Variant::Success)
            ->reloadComponent('media.library');
    }

    /**
     * The upload field for this instance: the sealed context wins over the
     * package config, so a MediaLibrary can configure its own upload.
     */
    public function field(): FileUpload
    {
        $field = FileUpload::make('files', __('media::media.actions.upload.label'))
            ->multiple()
            ->maxSize((int) config('media.max_size'))
            ->disk($this->contextStringOrNull('disk') ?? (string) config('media.disk'));

        if ((bool) ($this->context('signed') ?? config('media.signed_uploads'))) {
            $field->signedUpload();
        }

        $acceptedTypes = array_values(array_filter(array_map(
            strval(...),
            (array) ($this->context('accepted_types') ?? config('media.accepted_types', [])),
        )));

        if ($acceptedTypes !== []) {
            $field->acceptedFileTypes($acceptedTypes);
        }

        return $field;
    }

    /**
     * @return list<Media>
     */
    private function storeUploads(mixed $value): array
    {
        $values = is_array($value) ? $value : [$value];
        $field = $this->field();
        $stored = [];

        $uploadedFiles = array_values(array_filter($values, fn (mixed $item): bool => $item instanceof UploadedFile));
        $signedKeys = array_values(array_filter($values, fn (mixed $item): bool => is_string($item) && $item !== ''));

        foreach ($uploadedFiles as $file) {
            $path = $file->storeAs(
                'media',
                Str::uuid()->toString().'.'.$file->getClientOriginalExtension(),
                $field->resolveDisk(),
            );

            $stored[] = Media::modelQuery()->create([
                'disk' => $field->resolveDisk(),
                'path' => $path,
                'name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType() ?? 'application/octet-stream',
                'category' => $this->contextStringOrNull('category'),
                'size' => $file->getSize(),
                'uploaded_by' => auth()->id(),
            ]);
        }

        if ($signedKeys !== []) {
            foreach ($field->finalizeSignedUploads(
                $signedKeys,
                fn (string $key, array $metadata): string => 'media/'.Str::uuid()->toString()
                    .($metadata['extension'] !== '' ? '.'.$metadata['extension'] : ''),
            ) as $upload) {
                $stored[] = Media::modelQuery()->create([
                    'disk' => $upload['disk'],
                    'path' => $upload['path'],
                    'name' => $upload['name'],
                    'mime_type' => $upload['mime_type'] ?? 'application/octet-stream',
                    'category' => $this->contextStringOrNull('category'),
                    'size' => $upload['size'] ?? 0,
                    'uploaded_by' => auth()->id(),
                ]);
            }
        }

        foreach ($stored as $media) {
            GenerateMediaConversions::dispatch($media);
        }

        return $stored;
    }
}
