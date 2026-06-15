<?php

declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\Page;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\PageSchema;
use Workbench\App\Components\ChatBox;

#[Page(route: '/chat')]
class ChatPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.chat.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('chat-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make(__('workbench.pages.chat.heading')),
                    Text::make(__('workbench.pages.chat.description')),
                    ChatBox::make('chat')->endpoint('/workbench/chat'),
                ]),
        ]);
    }
}
