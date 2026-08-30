<?php
declare(strict_types=1);

namespace Lattice\Form\Components;

use Closure;
use Lattice\Core\Support\Wire;
use Lattice\Form\Attributes\AsField;
use Lattice\Form\Enums\FieldType;
use Lattice\Form\RichContent;
use Lattice\Form\RichEditor\Attributes\AsEditorExtension;
use Lattice\Form\RichEditor\EditorExtension;
use Lattice\Form\RichEditor\EditorExtensionRegistry;
use Lattice\Form\RichEditor\Extensions\Blockquote;
use Lattice\Form\RichEditor\Extensions\Bold;
use Lattice\Form\RichEditor\Extensions\BulletList;
use Lattice\Form\RichEditor\Extensions\Code;
use Lattice\Form\RichEditor\Extensions\CodeBlock;
use Lattice\Form\RichEditor\Extensions\Details;
use Lattice\Form\RichEditor\Extensions\Emoji;
use Lattice\Form\RichEditor\Extensions\Heading;
use Lattice\Form\RichEditor\Extensions\Highlight;
use Lattice\Form\RichEditor\Extensions\HorizontalRule;
use Lattice\Form\RichEditor\Extensions\Italic;
use Lattice\Form\RichEditor\Extensions\Link;
use Lattice\Form\RichEditor\Extensions\OrderedList;
use Lattice\Form\RichEditor\Extensions\SlashMenu;
use Lattice\Form\RichEditor\Extensions\Strike;
use Lattice\Form\RichEditor\Extensions\Table;
use Lattice\Form\RichEditor\Extensions\TextAlign;
use Lattice\Form\RichEditor\Extensions\Underline;
use Lattice\Form\RichEditor\ValidatesEditorDocument;
use Lattice\Ui\Concerns\HasPlaceholder;

#[AsField(FieldType::RichEditor)]
class RichEditor extends Field
{
    use HasPlaceholder;

    /**
     * Computed in decorateProps() from the configured set — declared for the
     * generated wire type, like Field::$conditions.
     *
     * @var list<EditorExtension>
     */
    public array $extensions = [];

    public bool $toolbar = true;

    /**
     * The active set keyed by wire type (insertion-ordered), null while the
     * field still follows the defaults. Strings are unregistered types that
     * wire as a bare `{type}` for client-registered extensions.
     *
     * @var array<string, EditorExtension|string>|null
     */
    protected ?array $configuredExtensions = null;

    /**
     * @var Closure(): array<int, EditorExtension|string>|null
     */
    protected static ?Closure $defaultExtensionsResolver = null;

    /**
     * Replace the active extension set; order defines toolbar order. A string
     * matching a registered wire type instantiates that extension with its
     * defaults; an unknown string passes through untouched. Duplicate wire
     * types keep their first position while the last configuration wins.
     *
     * @param  array<int, EditorExtension|string>  $extensions
     */
    public function extensions(array $extensions): static
    {
        $this->configuredExtensions = $this->mergeExtensions([], $extensions);

        return $this;
    }

    /**
     * Add to the active set — the defaults when nothing was configured yet.
     * An already-active wire type is reconfigured in place.
     */
    public function withExtensions(EditorExtension|string ...$extensions): static
    {
        $this->configuredExtensions = $this->mergeExtensions($this->activeExtensions(), array_values($extensions));

        return $this;
    }

    /**
     * Remove from the active set, by extension class-string or wire type.
     */
    public function withoutExtensions(string ...$extensions): static
    {
        $active = $this->activeExtensions();

        foreach ($extensions as $extension) {
            $type = class_exists($extension) ? AsEditorExtension::wireTypeForClass($extension) : $extension;

            unset($active[$type]);
        }

        $this->configuredExtensions = $active;

        return $this;
    }

    /**
     * Hide the formatting toolbar; the slash menu stays the way to insert blocks.
     */
    public function withoutToolbar(): static
    {
        $this->toolbar = false;

        return $this;
    }

    /**
     * App-wide override of the set a fresh field starts from; null restores
     * the built-in defaults. Resolved lazily at serialization, so the hook
     * also applies to fields built before it was registered.
     *
     * @param  Closure(): array<int, EditorExtension|string>|null  $resolver
     */
    public static function defaultExtensionsUsing(?Closure $resolver): void
    {
        static::$defaultExtensionsResolver = $resolver;
    }

    /**
     * The default set, in toolbar order — matches the editor the client
     * rendered before extensions became configurable.
     *
     * @return array<int, EditorExtension|string>
     */
    protected function defaultExtensions(): array
    {
        return [
            Bold::make(),
            Italic::make(),
            Strike::make(),
            Underline::make(),
            Highlight::make(),
            Code::make(),
            Heading::make(),
            BulletList::make(),
            OrderedList::make(),
            Blockquote::make(),
            CodeBlock::make(),
            HorizontalRule::make(),
            TextAlign::make(),
            Link::make(),
            Table::make(),
            Details::make(),
            Emoji::make(),
            SlashMenu::make(),
        ];
    }

    #[\Override]
    public function castValue(mixed $value): mixed
    {
        $decoded = RichContent::decodeDocument($value);

        if ($decoded === null) {
            return $value;
        }

        return RichContent::make($decoded, $this->allowedServerTypes(), $this->editorExtensionInstances())->toArray();
    }

    #[\Override]
    protected function defaultRules(): array
    {
        return [
            ...parent::defaultRules(),
            new ValidatesEditorDocument($this->editorExtensionInstances()),
        ];
    }

    /**
     * @return list<EditorExtension>
     */
    protected function editorExtensionInstances(): array
    {
        return array_values(array_filter(
            $this->activeExtensions(),
            static fn (EditorExtension|string $extension): bool => $extension instanceof EditorExtension,
        ));
    }

    /**
     * The schema type names the active set allows in submitted documents.
     * Strings contribute nothing, so client-only extension types never store
     * content.
     *
     * @return list<string>
     */
    protected function allowedServerTypes(): array
    {
        $types = [];

        foreach ($this->editorExtensionInstances() as $extension) {
            $types = [...$types, ...$extension->serverTypes()];
        }

        return array_values(array_unique($types));
    }

    /**
     * @param  array<string, mixed>  $props
     * @return array<string, mixed>
     */
    #[\Override]
    protected function decorateProps(array $props): array
    {
        $props = parent::decorateProps($props);

        $props['extensions'] = array_map(
            static fn (EditorExtension|string $extension): array => $extension instanceof EditorExtension
                ? $extension->toWire()
                : ['type' => $extension, 'props' => Wire::map([])],
            array_values($this->activeExtensions()),
        );

        $document = RichContent::decodeDocument($props['value'] ?? null);

        if ($document !== null) {
            $props['value'] = RichContent::make($document, $this->allowedServerTypes(), $this->editorExtensionInstances())->toPreparedArray();
        }

        return $props;
    }

    /**
     * @return array<string, EditorExtension|string>
     */
    protected function activeExtensions(): array
    {
        if ($this->configuredExtensions !== null) {
            return $this->configuredExtensions;
        }

        $defaults = static::$defaultExtensionsResolver instanceof Closure
            ? (static::$defaultExtensionsResolver)()
            : $this->defaultExtensions();

        return $this->mergeExtensions([], $defaults);
    }

    /**
     * @param  array<string, EditorExtension|string>  $active
     * @param  array<int, EditorExtension|string>  $extensions
     * @return array<string, EditorExtension|string>
     */
    private function mergeExtensions(array $active, array $extensions): array
    {
        foreach ($extensions as $extension) {
            $resolved = is_string($extension) ? $this->resolveExtension($extension) : $extension;
            $type = $resolved instanceof EditorExtension ? $resolved->wireType() : $resolved;

            $active[$type] = $resolved;
        }

        return $active;
    }

    private function resolveExtension(string $type): EditorExtension|string
    {
        $class = app(EditorExtensionRegistry::class)->classFor($type);

        return $class !== null ? $class::make() : $type;
    }
}
