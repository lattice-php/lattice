<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Forms\FormData;

/**
 * Rows discriminated by their reserved `type` key: each row validates and
 * casts through the RowTemplate matching its type, `type` is required and
 * constrained to the declared templates, and it survives casting. The
 * templates serialize onto the wire node under `templates`.
 *
 * @api
 */
abstract class TypedRowsField extends RowsField
{
    public const string TYPE = 'type';

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
        $type = is_string($row[self::TYPE] ?? null) ? $row[self::TYPE] : null;

        foreach ($this->templates as $template) {
            if ($template->type === $type) {
                return $template->fields();
            }
        }

        return [];
    }

    #[\Override]
    protected function rowRulesAt(string $prefix, array $row, FormData $data, Request $request): array
    {
        $rules = parent::rowRulesAt($prefix, $row, $data, $request);

        $rules["{$prefix}.".self::TYPE] = [
            'required',
            Rule::in(array_map(static fn (RowTemplate $template): string => $template->type, $this->templates)),
        ];

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
    #[SerializationHook(priority: 300)]
    protected function serialiseTemplates(array $data): array
    {
        return [...$data, 'templates' => $this->templates];
    }
}
