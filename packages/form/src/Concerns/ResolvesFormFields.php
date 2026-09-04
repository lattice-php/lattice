<?php
declare(strict_types=1);

namespace Lattice\Form\Concerns;

use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Lattice\Core\Http\SubRequest;
use Lattice\Core\Option;
use Lattice\Form\Components\Field;
use Lattice\Form\Components\FileUpload;
use Lattice\Form\Components\Select;
use Lattice\Form\Components\SignedUpload;
use Lattice\Form\FormData;
use Lattice\Form\FormSchemaWalker;
use Lattice\Form\ResolveResponse;
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
    public function searchOptions(Request $request, SubRequest $sub): array
    {
        $data = FormData::fromRequest($request);
        $fields = $this->formFields($request);

        $instance = app(FormSchemaWalker::class)->find($fields, $sub->target, $data);
        $field = $instance?->field;

        abort_if($field === null, Response::HTTP_NOT_FOUND);
        abort_unless($field instanceof Select && $field->isSearchable(), Response::HTTP_UNPROCESSABLE_ENTITY);

        return ['options' => $field->resolveSearch($sub->query, $instance->scope, $request)];
    }

    public function signUpload(Request $request, SubRequest $sub): SignedUpload
    {
        $name = $sub->target;
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

            if ($field->valueChangedDuringResolution()) {
                $values[$instance->path] = $field->resolvedValue();
            }
        }

        return new ResolveResponse($fields, $values, $prefill);
    }
}
