<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Forms\FormData;

/**
 * Rows discriminated by their `type` key: each row validates and casts through
 * the RowTemplate matching its type, `type` itself is required and constrained
 * to the declared templates, and it survives casting. The templates serialize
 * onto the wire node under `templates`.
 *
 * @api Stable extension point for fields whose rows are typed templates.
 */
abstract class TypedRowsField extends RowsField
{
    /**
     * @var array<int, RowTemplate>
     */
    protected array $templates = [];

    /**
     * @param  array<int, RowTemplate>  $templates
     */
    public function templates(array $templates): static
    {
        $this->templates = $templates;

        return $this;
    }

    /**
     * @param  array<string, mixed>  $row
     * @return array<int, Field>
     */
    public function rowFields(array $row): array
    {
        $type = is_string($row['type'] ?? null) ? $row['type'] : null;

        foreach ($this->templates as $template) {
            if ($template->type === $type) {
                return $template->fields();
            }
        }

        return [];
    }

    #[\Override]
    public function nestedRules(FormData $data, Request $request): array
    {
        $rules = parent::nestedRules($data, $request);

        $types = array_map(static fn (RowTemplate $template): string => $template->type, $this->templates);

        foreach (array_keys($this->rows($data)) as $index) {
            $rules["{$this->name}.{$index}.type"] = ['required', 'in:'.implode(',', $types)];
        }

        return $rules;
    }

    #[\Override]
    public function castValue(mixed $value): mixed
    {
        if (! is_array($value)) {
            return [];
        }

        /** @var array<int, array<string, mixed>> $cast */
        $cast = parent::castValue($value);

        return array_map(static function (array $castRow, mixed $original): array {
            if (is_array($original) && isset($original['type'])) {
                return ['type' => $original['type']] + $castRow;
            }

            return $castRow;
        }, $cast, array_values($value));
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 300)]
    protected function serialiseTemplates(array $data): array
    {
        return [...$data, 'templates' => $this->templates];
    }
}
