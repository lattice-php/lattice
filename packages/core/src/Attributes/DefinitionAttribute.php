<?php
declare(strict_types=1);

namespace Lattice\Lattice\Attributes;

use Lattice\Lattice\Core\Contracts\DeclaresGate;
use Lattice\Lattice\Core\Definition;

/**
 * Base for the marker attributes that identify a Lattice definition — Form,
 * Action, BulkAction, Table, Fragment, Layout — by the registry `key` its
 * DefinitionRegistry resolves it under.
 *
 * `can` declares subject-less abilities the current user must pass before the
 * definition renders or its endpoint runs. They are checked in addition to
 * {@see Definition::authorize()}, so an override cannot
 * widen what the attribute declared. Abilities needing a subject stay in
 * `authorize()`, where the sealed context is available to resolve one.
 */
abstract class DefinitionAttribute implements DeclaresGate
{
    /**
     * @var array<int, string>
     */
    private readonly array $can;

    /**
     * @param  string|array<int, string>  $can
     */
    public function __construct(public readonly string $key, string|array $can = [])
    {
        $this->can = (array) $can;
    }

    public function can(): array
    {
        return $this->can;
    }
}
