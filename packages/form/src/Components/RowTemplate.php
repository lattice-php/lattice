<?php
declare(strict_types=1);

namespace Lattice\Form\Components;

use Illuminate\Support\Str;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Components\Concerns\HasChildSchema;
use Lattice\Ui\Components\ContainerComponent;

/**
 * A typed row template for a TypedRowsField: the schema of child Fields a row
 * of this type is built, validated, and cast from. Compiles to a
 * `RowTemplateData` value object for wire serialization.
 *
 * @api
 */
final class RowTemplate
{
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

    /**
     * @param  array<int, Component>  $children
     * @return array<int, Field>
     */
    private function collectFields(array $children): array
    {
        $fields = [];

        foreach ($children as $child) {
            if ($child instanceof Field) {
                $fields[] = $child;

                continue;
            }

            if ($child instanceof ContainerComponent) {
                foreach ($child->descendants() as $descendant) {
                    if ($descendant instanceof Field) {
                        $fields[] = $descendant;
                    }
                }
            }
        }

        return $fields;
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
