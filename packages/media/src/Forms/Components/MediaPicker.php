<?php
declare(strict_types=1);

namespace Lattice\Media\Forms\Components;

use Illuminate\Http\Request;
use Lattice\Form\Attributes\AsField;
use Lattice\Form\Components\Field;
use Lattice\Form\Contracts\ProvidesRowFields;
use Lattice\Form\FormData;
use Lattice\Media\Components\MediaLibrary;
use Lattice\Media\Models\Media;
use Lattice\Media\Rules\AttachableMedia;
use Lattice\Ui\Components\Concerns\HasChildSchema;
use LogicException;

#[AsField(type: 'media-picker')]
class MediaPicker extends Field implements ProvidesRowFields
{
    use HasChildSchema;

    public bool $multiple = false;

    public ?int $maxFiles = null;

    /** @var list<Field> */
    protected array $attachmentFields = [];

    /**
     * Existing attachments surfaced on edit as display descriptors; `values`
     * holds the row's attachment-field values.
     *
     * @var list<array{id: int, name: string, url: string|null, preview_url: string|null, mime_type: string, values: array<string, mixed>}>|null
     */
    public ?array $selected = null;

    #[\Override]
    public static function make(string $name, ?string $label = null): static
    {
        $field = parent::make($name, $label);

        return $field->schema([
            MediaLibrary::make($name.'-library')->picker(),
        ]);
    }

    public function multiple(bool $multiple = true): static
    {
        $this->multiple = $multiple;

        return $this;
    }

    public function maxFiles(int $maxFiles): static
    {
        $this->maxFiles = $maxFiles;

        return $this;
    }

    /**
     * Additional fields rendered per picked item; their values are written
     * into the attachment's meta by syncMedia(). `id` is reserved.
     *
     * @param  list<Field>  $fields
     */
    public function attachmentFields(array $fields): static
    {
        foreach ($fields as $field) {
            if ($field->name() === 'id') {
                throw new LogicException('Attachment fields must not declare an [id] field: the key is reserved for the media identity.');
            }
        }

        /** @phpstan-ignore-next-line arrayValues.list — defensive against string-keyed arrays */
        $this->attachmentFields = [...$this->attachmentFields, ...array_values($fields)];
        /** @phpstan-ignore-next-line arrayValues.list — defensive against string-keyed arrays */
        $this->schema([...$this->children, ...array_values($fields)]);

        return $this;
    }

    /**
     * @param  array<string, mixed>  $row
     * @return array<int, Field>
     */
    public function rowFields(array $row): array
    {
        return $this->attachmentFields;
    }

    /**
     * @param  array<string, mixed>  $row
     */
    public function rowField(array $row, string $name): ?Field
    {
        foreach ($this->attachmentFields as $field) {
            if ($field->name() === $name) {
                return $field;
            }
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $row
     */
    public function rowScope(FormData $form, array $row): FormData
    {
        return FormData::make([...$form->all(), ...$row]);
    }

    public function prefillRowFields(mixed $rows, ?FormData $form = null, ?Request $request = null): void
    {
        foreach ($this->attachmentFields as $field) {
            $values = [];

            foreach ($this->rowsOf($rows) as $row) {
                $value = $row[$field->name()] ?? null;

                foreach (is_array($value) ? $value : [$value] as $item) {
                    if (is_scalar($item) && (string) $item !== '') {
                        $values[(string) $item] = $item;
                    }
                }
            }

            if ($values !== []) {
                $field->hydrateState(array_values($values), $form, $request);
            }
        }
    }

    /**
     * Normalizes any accepted value shape into rows: bare ids become id rows,
     * a single object row is wrapped, null/empty becomes no rows.
     *
     * @return list<array<string, mixed>>
     */
    protected function rowsOf(mixed $value): array
    {
        if (in_array($value, [null, '', []], true)) {
            return [];
        }

        if (! is_array($value)) {
            return [['id' => $value]];
        }

        if (! array_is_list($value)) {
            return [$value];
        }

        return array_map(
            static fn (mixed $row): array => is_array($row) ? $row : ['id' => $row],
            $value,
        );
    }

    #[\Override]
    public function hydrateState(mixed $value, ?FormData $form = null, ?Request $request = null): void
    {
        $rows = $this->rowsOf($value);
        $ids = array_values(array_filter(array_column($rows, 'id'), is_numeric(...)));
        $media = Media::modelQuery()->findMany($ids)->keyBy(fn (Media $row): int => (int) $row->getKey());

        $this->selected = array_values(collect($rows)
            ->map(function (array $row) use ($media): ?array {
                $id = $row['id'] ?? null;
                $item = is_numeric($id) ? $media->get((int) $id) : null;

                if ($item === null) {
                    return null;
                }

                return [
                    'id' => (int) $item->getKey(),
                    'name' => $item->name,
                    'url' => $item->url(),
                    'preview_url' => $item->previewUrl(),
                    'mime_type' => $item->mime_type,
                    'values' => array_diff_key($row, ['id' => true]),
                ];
            })
            ->filter()
            ->all());
    }

    /**
     * @return array<int, mixed>
     */
    #[\Override]
    protected function defaultRules(): array
    {
        if ($this->attachmentFields !== []) {
            $rules = ['nullable', 'array'];
            $max = $this->multiple ? $this->maxFiles : 1;

            return $max === null ? $rules : [...$rules, "max:{$max}"];
        }

        if (! $this->multiple) {
            return ['nullable', 'integer', new AttachableMedia];
        }

        return $this->maxFiles === null
            ? ['nullable', 'array']
            : ['nullable', 'array', "max:{$this->maxFiles}"];
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    #[\Override]
    public function nestedRules(FormData $data, Request $request): array
    {
        if ($this->attachmentFields === []) {
            return $this->multiple
                ? ["{$this->name()}.*" => ['integer', new AttachableMedia]]
                : [];
        }

        $rules = [];

        foreach ($this->rowsOf($data->get($this->name())) as $index => $row) {
            $scope = $this->rowScope($data, $row);
            $rules["{$this->name()}.{$index}.id"] = ['required', 'integer', new AttachableMedia];

            foreach ($this->attachmentFields as $field) {
                if (! $field->isVisible($scope)) {
                    continue;
                }

                $fieldRules = $field->resolvedRulesWithRequired($scope, $request);

                // excludeUnvalidatedArrayKeys drops a row's unruled keys once a sibling
                // has a rule, so give every field a passthrough.
                $rules["{$this->name()}.{$index}.{$field->name()}"] = $fieldRules !== [] ? $fieldRules : ['sometimes', 'nullable'];
            }
        }

        return $rules;
    }

    #[\Override]
    public function castValue(mixed $value): mixed
    {
        if ($this->attachmentFields === []) {
            return $value;
        }

        $rows = array_map(function (array $row): array {
            $cast = ['id' => (int) ($row['id'] ?? 0)];

            foreach ($this->attachmentFields as $field) {
                $cast[$field->name()] = $field->castValue($row[$field->name()] ?? null);
            }

            return $cast;
        }, $this->rowsOf($value));

        return $this->multiple ? $rows : ($rows[0] ?? null);
    }
}
