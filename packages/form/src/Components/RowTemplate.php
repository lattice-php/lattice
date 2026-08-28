<?php
declare(strict_types=1);

namespace Lattice\Form\Components;

use Illuminate\Support\Str;
use Lattice\Form\Components\Concerns\CollectsSchemaFields;
use Lattice\Ui\Components\Concerns\HasChildSchema;

/**
 * A typed row template for a TypedRowsField: the schema of child Fields a row
 * of this type is built, validated, and cast from. Compiles to a
 * `RowTemplateData` value object for wire serialization.
 *
 * @api
 */
final class RowTemplate
{
    use CollectsSchemaFields;
    use HasChildSchema;

    private ?string $label = null;

    private function __construct(public readonly string $type) {}

    public static function make(string $type): self
    {
        return new self($type);
    }

    public function label(string $label): self
    {
        $this->label = $label;

        return $this;
    }

    /**
     * The template's Fields, collected through layout containers (Grid,
     * Stack) so a template can shape its row. Fields themselves stay atomic —
     * a nested rows field owns its children via ProvidesRowFields.
     *
     * @return array<int, Field>
     */
    public function fields(): array
    {
        return $this->collectFields($this->resolvedChildren());
    }

    public function data(): RowTemplateData
    {
        return new RowTemplateData(
            type: $this->type,
            label: $this->label ?? Str::headline($this->type),
            schema: array_values($this->renderableChildren()),
        );
    }
}
