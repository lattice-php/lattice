<?php
declare(strict_types=1);

namespace Lattice\Lattice\Attributes;

use Attribute;

/**
 * Base marker for every class that appears in the generated TypeScript module:
 * plain on enums and value objects; extended by AsComponent/AsEffect, which add
 * the wire discriminator. One IS_INSTANCEOF scan finds the whole wire surface.
 */
#[Attribute(Attribute::TARGET_CLASS)]
readonly class TypeScript {}
