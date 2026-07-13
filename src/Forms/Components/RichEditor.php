<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Closure;
use Lattice\Lattice\Forms\Attributes\AsField;
use Lattice\Lattice\Forms\Enums\FieldType;
use Lattice\Lattice\Forms\RichContent;
use Lattice\Lattice\Forms\RichEditor\Attributes\AsEditorExtension;
use Lattice\Lattice\Forms\RichEditor\EditorExtension;
use Lattice\Lattice\Forms\RichEditor\EditorExtensionRegistry;
use Lattice\Lattice\Forms\RichEditor\Extensions\Blockquote;
use Lattice\Lattice\Forms\RichEditor\Extensions\Bold;
use Lattice\Lattice\Forms\RichEditor\Extensions\BulletList;
use Lattice\Lattice\Forms\RichEditor\Extensions\Code;
use Lattice\Lattice\Forms\RichEditor\Extensions\CodeBlock;
use Lattice\Lattice\Forms\RichEditor\Extensions\Details;
use Lattice\Lattice\Forms\RichEditor\Extensions\Emoji;
use Lattice\Lattice\Forms\RichEditor\Extensions\Heading;
use Lattice\Lattice\Forms\RichEditor\Extensions\Highlight;
use Lattice\Lattice\Forms\RichEditor\Extensions\HorizontalRule;
use Lattice\Lattice\Forms\RichEditor\Extensions\Italic;
use Lattice\Lattice\Forms\RichEditor\Extensions\Link;
use Lattice\Lattice\Forms\RichEditor\Extensions\OrderedList;
use Lattice\Lattice\Forms\RichEditor\Extensions\Strike;
use Lattice\Lattice\Forms\RichEditor\Extensions\Table;
use Lattice\Lattice\Forms\RichEditor\Extensions\TextAlign;
use Lattice\Lattice\Forms\RichEditor\Extensions\Underline;
use Lattice\Lattice\Ui\Concerns\HasPlaceholder;

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
        ];
    }

    #[\Override]
    public function castValue(mixed $value): mixed
    {
        if (! is_string($value) || $value === '') {
            return $value;
        }

        $decoded = json_decode($value, true);

        if (! is_array($decoded)) {
            return $value;
        }

        return RichContent::make($decoded)->toArray();
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
                : ['type' => $extension],
            array_values($this->activeExtensions()),
        );

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

        return $class !== null && is_a($class, EditorExtension::class, true) ? $class::make() : $type;
    }
}
