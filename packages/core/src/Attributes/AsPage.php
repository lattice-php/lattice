<?php

declare(strict_types=1);

namespace Lattice\Core\Attributes;

use Attribute;
use BackedEnum;
use Lattice\Core\Authorization;
use Lattice\Core\Contracts\DeclaresGate;
use Lattice\Core\Enums\PageLayout;
use Lattice\Core\Enums\PageWidth;

/**
 * `on` names a route parameter whose resolved value becomes the `can` gate
 * subject: an object route-model binds to as is, a scalar resolves through a
 * `Lattice::context()` resolver registered under the same key. Either the
 * parameter must be bound to its model — type it in `render()`, since
 * `SubstituteBindings` binds by the controller signature — or a resolver of
 * the same key must be registered. An unbound, unresolvable parameter yields
 * no subject and the gate denies.
 *
 * When `on` is set, the registered route carries `Lattice\Http\Middleware\
 * AuthorizeGateSubject` rather than the framework's own `can:` middleware —
 * that middleware hands an unbound route parameter to the gate as a raw
 * scalar, blind to a registered resolver. `AuthorizeGateSubject` and
 * `Page::gateSubject()` (used by `toResponse()`/`callAction()`) both resolve
 * the subject through the same `Lattice\Support\GateSubjects::fromRoute()`,
 * so the middleware and the page body can never disagree.
 */
#[Attribute(Attribute::TARGET_CLASS)]
final readonly class AsPage implements DeclaresGate
{
    /**
     * @var array<int, string>
     */
    private array $can;

    /**
     * @param  array<int, string>|string|null  $middleware
     * @param  string|BackedEnum|array<int, string|BackedEnum>  $can
     */
    public function __construct(
        public ?string $route = null,
        public ?string $name = null,
        public PageLayout|string|null $layout = null,
        public ?PageWidth $width = null,
        public array|string|null $middleware = null,
        string|BackedEnum|array $can = [],
        public ?string $on = null,
    ) {
        $this->can = Authorization::abilities($can);
    }

    public function can(): array
    {
        return $this->can;
    }

    public function on(): ?string
    {
        return $this->on;
    }
}
