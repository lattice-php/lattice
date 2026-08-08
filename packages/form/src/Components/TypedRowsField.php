<?php
declare(strict_types=1);

namespace Lattice\Form\Components;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Lattice\Core\Attributes\SerializationHook;
use Lattice\Form\FormData;

/**
 * Rows discriminated by their reserved `type` key: each row validates and
 * casts through the RowTemplate matching its type, `type` is required and
 * constrained to the declared templates, and it survives casting. The
 * templates compile to RowTemplateData and serialize onto the wire node
 * under `props.templates`.
 *
 * @api
 */
abstract class TypedRowsField extends RowsField
{
    public const string TYPE = 'type';

    /**
     * @var array<int, RowTemplate>
     */
    protected array $rowTemplates = [];

    /** @var list<RowTemplateData> */
    public array $templates = [];

    /**
     * @param  array<int, RowTemplate>  $templates
     */
    public function templates(array $templates): static
    {
        $this->rowTemplates = $templates;

        return $this;
    }

    /**
     * @param  array<string, mixed>  $row
     * @return array<int, Field>
     */
    public function rowFields(array $row): array
    {
        $type = is_string($row[self::TYPE] ?? null) ? $row[self::TYPE] : null;

        foreach ($this->rowTemplates as $template) {
            if ($template->type === $type) {
                return $template->fields();
            }
        }

        return [];
    }

    #[\Override]
    protected function rulesForRows(array $rows, FormData $data, Request $request): array
    {
        $rules = parent::rulesForRows($rows, $data, $request);

        $typeRules = [
            'required',
            Rule::in(array_map(static fn (RowTemplate $template): string => $template->type, $this->rowTemplates)),
        ];

        foreach (array_keys($rows) as $index) {
            $rules["{$this->name}.{$index}.".self::TYPE] = $typeRules;
        }

        return $rules;
    }

    #[\Override]
    protected function castRow(array $castRow, mixed $original): array
    {
        $castRow = parent::castRow($castRow, $original);

        if (is_array($original) && isset($original[self::TYPE])) {
            return [self::TYPE => $original[self::TYPE]] + $castRow;
        }

        return $castRow;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 190)]
    protected function prepareTemplates(array $data): array
    {
        $this->templates = array_map(
            static fn (RowTemplate $template): RowTemplateData => $template->data(),
            $this->rowTemplates,
        );

        return $data;
    }
}
