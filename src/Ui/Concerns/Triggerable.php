<?php

declare(strict_types=1);

namespace Lattice\Lattice\Ui\Concerns;

use InvalidArgumentException;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Effects\Contracts\Effect;

/**
 * The shared click surface for clickable components (Link, Button, MenuItem): a
 * label plus exactly one behavior — navigate to an `href`, run a server `action`,
 * or dispatch client `effects`. The three are mutually exclusive.
 */
trait Triggerable
{
    use HasHttpMethod;
    use HasLabel;

    public ?string $href = null;

    public ?Action $action = null;

    /** @var array<int, Effect> */
    public array $effects = [];

    public function href(string $href): static
    {
        $this->assertBehaviorAllowed('href');

        $this->href = $href;

        return $this;
    }

    /**
     * @param  class-string<ActionDefinition>  $actionClass
     * @param  array<string, mixed>  $context
     */
    public function action(string $actionClass, array $context = []): static
    {
        $this->assertBehaviorAllowed('action');

        $this->action = Action::use($actionClass, $context);

        return $this;
    }

    public function effects(Effect ...$effects): static
    {
        $this->assertBehaviorAllowed('effects');

        $this->effects = $effects;

        return $this;
    }

    /**
     * A clickable carries exactly one behavior. Re-setting the same one is fine;
     * mixing an href, an action, and effects is not.
     */
    protected function assertBehaviorAllowed(string $incoming): void
    {
        $set = array_keys(array_filter([
            'href' => $this->href !== null,
            'action' => $this->action !== null,
            'effects' => $this->effects !== [],
        ]));

        if (array_diff($set, [$incoming]) !== []) {
            throw new InvalidArgumentException('A clickable component can carry only one of an href, an action, or effects.');
        }
    }
}
