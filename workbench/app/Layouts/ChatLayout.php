<?php
declare(strict_types=1);

namespace Workbench\App\Layouts;

use Illuminate\Http\Request;
use Lattice\Core\Attributes\AsLayout;
use Lattice\Layouts\Components\Breadcrumbs;
use Lattice\Layouts\Components\Outlet;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\Enums\StackDirection;
use Lattice\Ui\Enums\Width;
use Lattice\Ui\PageSchema;

#[AsLayout('app-chat')]
final class ChatLayout extends AppLayout
{
    #[\Override]
    public function schema(PageSchema $schema, Request $request): PageSchema
    {
        return $schema->schema([
            Stack::make('app-shell')
                ->direction(StackDirection::Row)
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
