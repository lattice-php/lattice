<?php
declare(strict_types=1);

namespace Workbench\App\Http\Controllers;

use Illuminate\Contracts\View\View;
use Lattice\Blocks\BlockHtmlRenderer;
use Workbench\App\Models\Page;

final readonly class PublicPageController
{
    public function __construct(private BlockHtmlRenderer $renderer) {}

    public function __invoke(Page $page): View
    {
        abort_unless($page->published !== null, 404);

        return view('workbench::public.page', [
            'page' => $page,
            'content' => $this->renderer->render($page->published),
        ]);
    }
}
