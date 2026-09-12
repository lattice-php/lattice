<?php
declare(strict_types=1);

namespace Lattice\Core\Attributes;

use BackedEnum;
use Lattice\Core\Authorization;
use Lattice\Core\Contracts\DeclaresGate;
use Lattice\Core\Definition;

/**
 * Base for the marker attributes that identify a Lattice definition — Form,
 * Action, BulkAction, Table, Fragment, Layout — by the registry `key` its
 * DefinitionRegistry resolves it under.
 *
 * `can` declares the abilities the current user must pass before the
 * definition renders or its endpoint runs. They are checked in addition to
 * {@see Definition::authorize()}, so an override cannot widen what the
 * attribute declared. `on` names the context key whose resolved value becomes
 * the gate subject; without it the check stays subject-less, as it always was.
 *
 * `middleware` is the stack the definition's endpoint runs behind. It
 * replaces the `lattice.<group>.middleware` default rather than adding to it,
 * so a definition reachable before login (a two-factor enrolment form served
 * mid-login, say) can drop `auth` without the app loosening the default for
 * every other definition. `can` and `authorize()` still run either way.
 */
abstract class DefinitionAttribute implements DeclaresGate
{
    /**
     * @var array<int, string>
     */
    private readonly array $can;

    /**
     * @var array<int, string>|null
     */
    private readonly ?array $middleware;

    /**
     * @param  string|BackedEnum|array<int, string|BackedEnum>  $can
     * @param  array<int, string>|string|null  $middleware
     */
    public function __construct(
        public readonly string $key,
        string|BackedEnum|array $can = [],
        private readonly ?string $on = null,
        array|string|null $middleware = null,
    ) {
        $this->can = Authorization::abilities($can);
        $this->middleware = $middleware === null ? null : array_values((array) $middleware);
    }

    public function can(): array
    {
        return $this->can;
    }

    public function on(): ?string
    {
        return $this->on;
    }

    /**
     * @return array<int, string>|null
     */
    public function middleware(): ?array
    {
        return $this->middleware;
    }
}
