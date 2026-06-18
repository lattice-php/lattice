<?php
declare(strict_types=1);

namespace Workbench\App\Layouts;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsLayout;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\Enums\Width;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Layouts\Components\Breadcrumbs;
use Lattice\Lattice\Layouts\Components\Outlet;

#[AsLayout('app-chat')]
final class ChatLayout extends AppLayout
{
    #[\Override]
    public function schema(PageSchema $schema, Request $request): PageSchema
    {
        return $schema->schema([
            Stack::make('app-shell')
                ->direction('row')
                ->gap(Gap::None)
                ->schema([
                    $this->sidebar(),
                    Stack::make('app-main')
                        ->width(Width::Fill)
                        ->schema([
                            $this->topbar(),
                            Breadcrumbs::make(),
                            Outlet::make(),
                        ]),
                    Stack::make('chat-rail')
                        ->width(Width::Small)
                        ->schema([
                            $this->chatBox()->fill(),
                        ]),
                ]),
        ]);
    }
}
