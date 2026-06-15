<?php
declare(strict_types=1);

namespace Lattice\Lattice\Attributes;

/**
 * Base for the marker attributes that identify a Lattice definition — Form,
 * Action, BulkAction, Table, Fragment, Layout — by the registry `key` its
 * DefinitionRegistry resolves it under.
 */
abstract class DefinitionAttribute
{
    public function __construct(public readonly string $key) {}
}
