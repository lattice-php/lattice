<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\Page;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\Components\Form;
use Workbench\App\Forms\GroupForm;
use Workbench\App\Models\Group;

#[Page(route: '/groups/{group}/edit')]
class GroupEditPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.commerce.groups.pages.edit.title');
    }

    public function render(PageSchema $schema, Group $group): PageSchema
    {
        return $schema->schema([
            Stack::make('group-edit-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make(__('workbench.commerce.groups.pages.edit.heading')),
                    Form::use(GroupForm::class)
                        ->method(HttpMethod::Patch)
                        ->submitLabel(__('workbench.commerce.groups.pages.edit.submit'))
                        ->fill([
                            'name' => $group->name,
                        ])
                        ->context([
                            'group_id' => $group->getKey(),
                        ]),
                ]),
        ]);
    }
}
