<?php
declare(strict_types=1);

namespace Lattice\Core\Contracts;

/**
 * Marks a domain's top-level wrapper node (implemented by `Lattice\Form\Components\Form`)
 * so the wire model can single it out from its own domain's field types without
 * Core depending on the Form package.
 */
interface FormRootComponent {}
