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
 */
abstract class DefinitionAttribute implements DeclaresGate
{
    /**
     * @var array<int, string>
     */
    private readonly array $can;

    /**
     * @param  string|BackedEnum|array<int, string|BackedEnum>  $can
     */
    public function __construct(public readonly string $key, string|BackedEnum|array $can = [], private readonly ?string $on = null)
    {
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
