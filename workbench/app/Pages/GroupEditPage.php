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
use Workbench\App\Models\Group;

#[AsPage(route: '/groups/{group}/edit')]
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
                    Form::use(GroupForm::class, ['group_id' => $group->getKey()])
                        ->method(HttpMethod::Patch)
                        ->submitLabel(__('workbench.commerce.groups.pages.edit.submit'))
                        ->fill([
                            'name' => $group->name,
                        ]),
                ]),
        ]);
    }
}
