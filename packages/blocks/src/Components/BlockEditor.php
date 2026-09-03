<?php
declare(strict_types=1);

namespace Lattice\Blocks\Components;

use Lattice\Blocks\BlockDocument;
use Lattice\Blocks\BlockEditorDefinition;
use Lattice\Blocks\BlockEditorRegistry;
use Lattice\Blocks\BlockPatternData;
use Lattice\Blocks\BlockTypeData;
use Lattice\Core\Attributes\AsComponent;
use Lattice\Core\Attributes\WireMap;
use Lattice\Core\Contracts\InteractiveComponent;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Components\IsInteractive;

#[AsComponent('blocks.editor')]
class BlockEditor extends Component implements InteractiveComponent
{
    use IsInteractive;

    public ?string $endpoint = null;

    public BlockDocument $document;

    public int $revision = 0;

    /** @var list<BlockTypeData> */
    public array $types = [];

    /** @var list<BlockPatternData> */
    public array $patterns = [];

    /**
     * The shallow render of every stored block, keyed by block id.
     *
     * @var array<string, Component>
     */
    #[WireMap]
    public array $rendered = [];

    public ?string $previewUrl = null;

    public ?string $title = null;

    public function __construct(?string $key = null)
    {
        parent::__construct($key);

        $this->document = BlockDocument::empty();
    }

    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    /**
     * @param  class-string<BlockEditorDefinition>  $definition
     * @param  array<string, mixed>  $context
     */
    public static function use(string $definition, array $context = []): static
    {
        /** @var static */
        return app(BlockEditorRegistry::class)->component($definition, $context);
    }

    public function endpoint(string $endpoint): static
    {
        $this->endpoint = $endpoint;

        return $this;
    }

    public function document(BlockDocument $document): static
    {
        $this->document = $document;

        return $this;
    }

    public function revision(int $revision): static
    {
        $this->revision = $revision;

        return $this;
    }

    /**
     * @param  list<BlockTypeData>  $types
     */
    public function types(array $types): static
    {
        $this->types = $types;

        return $this;
    }

    /**
     * @param  list<BlockPatternData>  $patterns
     */
    public function patterns(array $patterns): static
    {
        $this->patterns = $patterns;

        return $this;
    }

    /**
     * @param  array<string, Component>  $rendered
     */
    public function rendered(array $rendered): static
    {
        $this->rendered = $rendered;

        return $this;
    }

    public function previewUrl(?string $previewUrl): static
    {
        $this->previewUrl = $previewUrl;

        return $this;
    }

    public function title(?string $title): static
    {
        $this->title = $title;

        return $this;
    }
}
