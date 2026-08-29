<?php
declare(strict_types=1);

namespace Lattice\Board\Components;

use InvalidArgumentException;
use Lattice\Board\BoardColumnData;
use Lattice\Board\BoardDefinition;
use Lattice\Board\BoardRegistry;
use Lattice\Board\BoardResult;
use Lattice\Core\Attributes\AsComponent;
use Lattice\Core\Contracts\InteractiveComponent;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Components\Concerns\HasChildSchema;
use Lattice\Ui\Components\IsInteractive;

#[AsComponent('board')]
class Board extends Component implements InteractiveComponent
{
    use HasChildSchema;
    use IsInteractive;

    public ?string $endpoint = null;

    /** @var list<BoardColumnData> */
    public array $columns = [];

    public ?BoardResult $result = null;

    public int $perColumn = 25;

    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    /**
     * Build a board from a registered {@see BoardDefinition}: the
     * definition's source populates the initial result, and the sealed
     * reference lets the endpoint re-resolve it with the same context on a
     * later request.
     *
     * @param  class-string<BoardDefinition>  $definition
     * @param  array<string, mixed>  $context
     */
    public static function use(string $definition, array $context = []): static
    {
        /** @var static */
        return app(BoardRegistry::class)->component($definition, $context);
    }

    public function endpoint(string $endpoint): static
    {
        $this->endpoint = $endpoint;

        return $this;
    }

    /**
     * @param  list<BoardColumnData>  $columns
     */
    public function columns(array $columns): static
    {
        $this->columns = $columns;

        return $this;
    }

    public function result(BoardResult $result): static
    {
        $this->result = $result;

        return $this;
    }

    public function perColumn(int $perColumn): static
    {
        if ($perColumn < 1) {
            throw new InvalidArgumentException('Board perColumn must be one or greater.');
        }

        $this->perColumn = $perColumn;

        return $this;
    }
}
