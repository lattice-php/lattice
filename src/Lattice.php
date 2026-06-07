<?php

declare(strict_types=1);

namespace Bambamboole\Lattice;

use Bambamboole\Lattice\Forms\FormDefinition;
use Bambamboole\Lattice\Forms\FormRegistry;
use Bambamboole\Lattice\Tables\TableDefinition;
use Bambamboole\Lattice\Tables\TableRegistry;

class Lattice
{
    /**
     * @param  class-string<FormDefinition>|array<int, class-string<FormDefinition>>  $forms
     */
    public static function forms(string|array $forms): void
    {
        app(FormRegistry::class)->register($forms);
    }

    /**
     * @param  class-string<TableDefinition>|array<int, class-string<TableDefinition>>  $tables
     */
    public static function tables(string|array $tables): void
    {
        app(TableRegistry::class)->register($tables);
    }
}
