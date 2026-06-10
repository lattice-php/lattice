<?php

declare(strict_types=1);

namespace Workbench\App\Layouts;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\Layout;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Link;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Layouts\Components\Outlet;
use Lattice\Lattice\Layouts\LayoutDefinition;

#[Layout('app')]
final class AppLayout extends LayoutDefinition
{
    public function schema(PageSchema $schema, Request $request): PageSchema
    {
        return $schema->schema([
            Stack::make('app-shell')
                ->direction('row')
                ->gap(Gap::ExtraLarge)
                ->schema([
                    Stack::make('app-sidebar')
                        ->gap(Gap::Small)
                        ->schema([
                            Heading::make('Lattice', 2),
                            Link::make('Home')->href('/'),
                            Link::make('Tables')->href('/tables'),
                            Link::make('Products')->href('/products'),
                            Link::make('Form Showcase')->href('/showcase'),
                        ]),
                    Stack::make('app-main')
                        ->schema([
                            Outlet::make(),
                        ]),
                ]),
        ]);
    }
}
