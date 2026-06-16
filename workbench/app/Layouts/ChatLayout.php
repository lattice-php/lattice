<?php
declare(strict_types=1);

namespace Workbench\App\Layouts;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\Layout;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Enums\FloatingPlacement;
use Lattice\Lattice\Core\Enums\Width;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Layouts\Components\Breadcrumbs;
use Lattice\Lattice\Layouts\Components\Outlet;

#[Layout('app-chat')]
final class ChatLayout extends AppLayout
{
    public function schema(PageSchema $schema, Request $request): PageSchema
    {
        return $schema->schema([
            Stack::make('app-shell')
                ->direction('row')
                ->schema([
                    $this->sidebar(),
                    Stack::make('app-main')
                        ->width(Width::Fill)
                        ->schema([
                            Breadcrumbs::make(),
                            Outlet::make(),
                        ]),
                    Stack::make('chat-rail')
                        ->width(Width::Small)
                        ->schema([
                            $this->chatWindow()->defaultOpen()->fill(),
                        ]),
                ]),
            $this->localeSwitcherPanel(FloatingPlacement::BottomStart),
            $this->chatLayoutTogglePanel(),
        ]);
    }
}
