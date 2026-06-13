<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Concerns;

use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Forms\Components\Field;
use Lattice\Lattice\Forms\Components\FileUpload;
use Lattice\Lattice\Forms\Components\Select;
use Lattice\Lattice\Forms\Contracts\ProvidesRowFields;
use Lattice\Lattice\Forms\Contracts\ProvidesRowPrefills;
use Lattice\Lattice\Forms\FormData;
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

        $field = $fields
            ->first(fn (Field $field): bool => $field->name() === $name);
        $scope = $data;

        if ($field === null) {
            [$field, $scope] = $this->rowFieldTarget($fields, $name, $data);
        }

        abort_if($field === null, Response::HTTP_NOT_FOUND);
        abort_unless($field instanceof Select && $field->isSearchable(), Response::HTTP_UNPROCESSABLE_ENTITY);

        return ['options' => $field->resolveSearch($query, $scope, $request)];
    }

    /**
     * @param  Collection<int, Field>  $fields
     * @return array{0: Field|null, 1: FormData}
     */
    private function rowFieldTarget(Collection $fields, string $path, FormData $data): array
    {
        $segments = explode('.', $path);

        if (count($segments) < 3 || ! ctype_digit($segments[1])) {
            return [null, $data];
        }

        $base = $segments[0];
        $rowIndex = (int) $segments[1];
        $name = implode('.', array_slice($segments, 2));

        $container = $fields->first(
            fn (Field $field): bool => $field->name() === $base && $field instanceof ProvidesRowFields,
        );

        if (! $container instanceof ProvidesRowFields) {
            return [null, $data];
        }

        $rows = $data->get($base);

        if (! is_array($rows) || ! array_key_exists($rowIndex, $rows) || ! is_array($rows[$rowIndex])) {
            return [null, $data];
        }

        $row = $rows[$rowIndex];
        $field = $container->rowField($row, $name);

        if ($field === null) {
            return [null, $data];
        }

        return [$field, $container->rowScope($data, $row)];
    }

    /**
     * @return array{key: string, url: string, headers: array<string, mixed>, method: string}
     */
    public function signUpload(Request $request): array
    {
        $name = $request->string('_upload')->toString();
        $data = FormData::fromRequest($request);
        $fields = $this->formFields($request);

        $field = $fields
            ->first(fn (Field $field): bool => $field->name() === $name);

        if ($field === null) {
            [$field] = $this->rowFieldTarget($fields, $name, $data);
        }

        abort_if($field === null, Response::HTTP_NOT_FOUND);
        abort_unless($field instanceof FileUpload && $field->usesSignedUpload(), Response::HTTP_UNPROCESSABLE_ENTITY);

        return $field->signUpload($request);
    }

    /**
     * @return array{fields: array<string, mixed>, values: array<string, mixed>, prefill: array<string, mixed>}
     */
    public function resolveFields(Request $request): array
    {
        $data = FormData::fromRequest($request);
        $fields = [];
        $values = [];
        $prefill = [];

        foreach ($this->formFields($request) as $field) {
            if ($field instanceof ProvidesRowPrefills) {
                $prefill = [...$prefill, ...$field->rowPrefillValues($data, $request)];
            } elseif ($field->hasPrefill()) {
                $prefill[$field->name()] = $field->resolvePrefillValue($data, $data, $request);
            }

            if (! $field->isComputed()) {
                continue;
            }

            $field->applyResolution($data, $request);
            $fields[$field->name()] = $field;

            if ($field->hasResolvedValue()) {
                $values[$field->name()] = $field->resolvedValue();
            }
        }

        return ['fields' => $fields, 'values' => $values, 'prefill' => $prefill];
    }
}
