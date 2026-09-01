<?php
declare(strict_types=1);

namespace Lattice\Ui\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Core\Attributes\SerializationHook;
use Lattice\Ui\Components\Entries\Entry;
use Lattice\Ui\Enums\DescriptionListSemantic;

/**
 * Label/value rows describing one subject.
 *
 * The rendered semantics follow the content: a list of plain entries is a `<dl>`
 * of `<dt>`/`<dd>` pairs, which is what a screen reader wants. As soon as one
 * entry carries a disclosure the list falls back to `role="list"`, because the
 * whole row becomes the toggle and a `<button>` may not wrap a `<dt>`/`<dd>`
 * pair. The choice is made here rather than guessed on the client.
 */
#[AsComponent('description-list')]
class DescriptionList extends ContainerComponent
{
    public bool $divided = true;

    public bool $bleed = false;

    public ?string $emptyLabel = null;

    public DescriptionListSemantic $semantic = DescriptionListSemantic::DescriptionList;

    protected mixed $record = null;

    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    public function divided(bool $divided = true): static
    {
        $this->divided = $divided;

        return $this;
    }

    /**
     * Run the row dividers across the gutter of a padded parent such as a Card,
     * so they divide the panel edge to edge while the rows stay aligned with
     * the rest of its content.
     */
    public function bleed(bool $bleed = true): static
    {
        $this->bleed = $bleed;

        return $this;
    }

    public function emptyLabel(?string $label): static
    {
        $this->emptyLabel = $label;

        return $this;
    }

    /**
     * The subject the entries read their values from. This may be an array, a
     * keyed Collection, an ArrayAccess object, a model, or a DTO. Entries given
     * an explicit value keep it.
     */
    public function record(mixed $record): static
    {
        $this->record = $record;

        return $this;
    }

    /**
     * @return array<int, Entry>
     */
    public function entries(): array
    {
        return array_values(array_filter(
            $this->descendants(),
            fn (Component $component): bool => $component instanceof Entry,
        ));
    }

    /**
     * Runs before the child schema serializes (priority 300) so each entry can
     * carry its resolved value into its own props.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 250)]
    protected function distributeRecord(array $data): array
    {
        foreach ($this->entries() as $entry) {
            $entry->hydrateFromRecord($this->record);
        }

        return $data;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 150)]
    protected function resolveSemantic(array $data): array
    {
        foreach ($this->entries() as $entry) {
            if ($entry->hasDisclosure()) {
                $this->semantic = DescriptionListSemantic::List;

                break;
            }
        }

        return $data;
    }
}
