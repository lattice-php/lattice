<?php
declare(strict_types=1);

namespace Lattice\Board\Components;

use InvalidArgumentException;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\Components\Action;
use Lattice\Board\BoardColumnData;
use Lattice\Board\BoardDefinition;
use Lattice\Board\BoardRegistry;
use Lattice\Board\BoardResult;
use Lattice\Core\Attributes\AsComponent;
use Lattice\Core\Contracts\InteractiveComponent;
use Lattice\Table\Filters\Filter;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Components\Concerns\HasChildSchema;
use Lattice\Ui\Components\IsInteractive;
use Lattice\Ui\Concerns\FiltersRenderableComponents;

#[AsComponent('board')]
class Board extends Component implements InteractiveComponent
{
    use FiltersRenderableComponents;
    use HasChildSchema;
    use IsInteractive;

    public ?string $endpoint = null;

    /** @var list<BoardColumnData> */
    public array $columns = [];

    /** @var list<Filter> */
    public array $filters = [];

    public bool $searchable = false;

    public ?BoardResult $result = null;

    public int $perColumn = 25;

    public bool $syncQuery = false;

    public ?string $queryKey = null;

    /** @var array{q: string, tf: array<string, mixed>} */
    public array $query = ['q' => '', 'tf' => []];

    public ?Action $moveAction = null;

    public ?Action $cardAction = null;

    public ?Action $createAction = null;

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

    /**
     * @param  list<Filter>  $filters
     */
    public function filters(array $filters): static
    {
        $this->filters = $this->renderableComponents($filters);

        return $this;
    }

    public function searchable(bool $searchable = true): static
    {
        $this->searchable = $searchable;

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

    public function syncQuery(bool $syncQuery): static
    {
        $this->syncQuery = $syncQuery;

        return $this;
    }

    public function queryKey(?string $queryKey): static
    {
        $this->queryKey = $queryKey;

        return $this;
    }

    /**
     * @param  array{q: string, tf: array<string, mixed>}  $query
     */
    public function query(array $query): static
    {
        $this->query = $query;

        return $this;
    }

    /**
     * @param  class-string<ActionDefinition>  $action
     * @param  array<string, mixed>  $context
     */
    public function moveAction(string $action, array $context = []): static
    {
        $this->moveAction = $this->boardAction($action, $context);

        return $this;
    }

    /**
     * @param  class-string<ActionDefinition>  $action
     * @param  array<string, mixed>  $context
     */
    public function cardAction(string $action, array $context = []): static
    {
        $this->cardAction = $this->boardAction($action, $context);

        return $this;
    }

    /**
     * @param  class-string<ActionDefinition>  $action
     * @param  array<string, mixed>  $context
     */
    public function createAction(string $action, array $context = []): static
    {
        $this->createAction = $this->boardAction($action, $context);

        return $this;
    }

    /**
     * @param  class-string<ActionDefinition>  $action
     * @param  array<string, mixed>  $context
     */
    private function boardAction(string $action, array $context): Action
    {
        $built = Action::use($action, $context);

        if ($this->signatureKey !== null) {
            $built->mergeContext([], ['board' => $this->signatureKey]);
        }

        return $built;
    }
}
