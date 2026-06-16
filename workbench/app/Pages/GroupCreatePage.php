<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\Components\Form;
use Workbench\App\Forms\GroupForm;

#[AsPage(route: '/groups/create')]
class GroupCreatePage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.commerce.groups.pages.create.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('group-create-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make(__('workbench.commerce.groups.pages.create.heading')),
                    Form::use(GroupForm::class)
                        ->method(HttpMethod::Post)
                        ->submitLabel(__('workbench.commerce.groups.pages.create.submit')),
                ]),
        ]);
    }
}
