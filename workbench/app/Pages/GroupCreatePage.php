<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Core\Attributes\AsPage;
use Lattice\Form\Components\Form;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\Enums\HttpMethod;
use Lattice\Ui\PageSchema;
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
