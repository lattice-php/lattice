<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Components;

use Lattice\Chat\Components\ChatBox;
use Lattice\Core\Attributes\AsPage;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\PageSchema;
use Workbench\App\Pages\WorkbenchPage;

#[AsPage(route: '/components/chat')]
final class ChatPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.components.chat.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('chat-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make($this->title()),
                    ChatBox::make('assistant-inline')
                        ->streamEndpoint('/workbench/chat/stream')
                        ->historyEndpoint('/workbench/chat/history')
                        ->title(__('workbench.assistant.title'))
                        ->placeholder(__('workbench.assistant.placeholder')),
                ]),
        ]);
    }
}
