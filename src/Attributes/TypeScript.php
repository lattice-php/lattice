<?php

declare(strict_types=1);

namespace Lattice\Lattice\Attributes;

use Attribute;

/**
 * Marks a backed enum or value object for inclusion in the generated built-in
 * TypeScript module (resources/js/types/generated.ts). Discovered over src/ by
 * the maintainer build tooling so the allow-list need not be hand-maintained.
 */
#[Attribute(Attribute::TARGET_CLASS)]
final class TypeScript {}
