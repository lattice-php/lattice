<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Concerns;

use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Forms\Components\Field;
use Lattice\Lattice\Forms\Components\FileUpload;
use Lattice\Lattice\Forms\Components\Select;
use Lattice\Lattice\Forms\Components\SignedUpload;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Forms\FormSchemaWalker;
use Lattice\Lattice\Forms\ResolveResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * Searchable-option and computed-field resolution against a set of form fields.
 * Shared by FormDefinition and form-bearing actions; the host supplies the
 * fields for the current request.
 */
trait ResolvesFormFields
{
    /**
     * The form fields to search and resolve against for the current request.
     *
     * @return Collection<int, Field>
     */
    abstract protected function formFields(Request $request): Collection;

    /**
     * Resolve the searchable options for a single field. The field's own resolver
     * owns the query, so this never touches an arbitrary model.
     *
     * @return array{options: list<Option>}
     */
    public function searchOptions(Request $request): array
    {
        $name = $request->string('_search')->toString();
        $query = $request->string('q')->toString();
        $data = FormData::fromRequest($request);
        $fields = $this->formFields($request);

        $instance = app(FormSchemaWalker::class)->find($fields, $name, $data);
        $field = $instance?->field;

        abort_if($field === null, Response::HTTP_NOT_FOUND);
        abort_unless($field instanceof Select && $field->isSearchable(), Response::HTTP_UNPROCESSABLE_ENTITY);

        return ['options' => $field->resolveSearch($query, $instance->scope, $request)];
    }

    /**
     * Resolve a newly-created option for a single creatable field. The field's own
     * resolver bears any persistence; this never touches an arbitrary model.
     *
     * @return array{option: Option|null}
     */
    public function createOption(Request $request): array
    {
        $name = $request->string('_create')->toString();
        $label = $request->string('q')->toString();
        $data = FormData::fromRequest($request);
        $fields = $this->formFields($request);

        $instance = app(FormSchemaWalker::class)->find($fields, $name, $data);
        $field = $instance?->field;

        abort_if($field === null, Response::HTTP_NOT_FOUND);
        abort_unless($field instanceof Select && $field->acceptsServerCreate(), Response::HTTP_UNPROCESSABLE_ENTITY);

        return ['option' => $field->resolveCreate($label, $instance->scope, $request)];
    }

    public function signUpload(Request $request): SignedUpload
    {
        $name = $request->string('_upload')->toString();
        $data = FormData::fromRequest($request);
        $fields = $this->formFields($request);

        $field = app(FormSchemaWalker::class)->find($fields, $name, $data)?->field;

        abort_if($field === null, Response::HTTP_NOT_FOUND);
        abort_unless($field instanceof FileUpload && $field->usesSignedUpload(), Response::HTTP_UNPROCESSABLE_ENTITY);

        return $field->signUpload($request);
    }

    public function resolveFields(Request $request): ResolveResponse
    {
        $data = FormData::fromRequest($request);
        $fields = [];
        $values = [];
        $prefill = [];

        foreach (app(FormSchemaWalker::class)->instances($this->formFields($request), $data) as $instance) {
            $field = $instance->field;

            if ($field->hasPrefill()) {
                $prefill[$instance->path] = $field->resolvePrefillValue($instance->scope, $data, $request);
            }

            if (! $field->isComputed()) {
                continue;
            }

            $field->applyResolution($instance->scope, $request);
            $fields[$instance->path] = $field;

            if ($field->hasResolvedValue()) {
                $values[$instance->path] = $field->resolvedValue();
            }
        }

        return new ResolveResponse($fields, $values, $prefill);
    }
}
