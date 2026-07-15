<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Components;

use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Actions\Components\ActionGroup;
use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Ui\Components\Heading;
use Lattice\Lattice\Ui\Components\Stack;
use Lattice\Lattice\Ui\Components\Text;
use Lattice\Lattice\Ui\Components\Tree;
use Lattice\Lattice\Ui\Enums\Gap;
use Lattice\Lattice\Ui\Values\TreeNode;
use Workbench\App\Pages\WorkbenchPage;

#[AsPage(route: '/components/tree')]
final class TreePage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.components.tree.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('tree-page')
                ->gap(Gap::ExtraLarge)
                ->schema([
                    Heading::make($this->title()),
                    Text::make(__('workbench.pages.components.tree.intro')),
                    Tree::make('demo-tree')
                        ->nodes([
                            TreeNode::make(__('workbench.pages.components.tree.categories.electronics.label'), 'electronics')
                                ->children([
                                    TreeNode::make(__('workbench.pages.components.tree.categories.electronics.laptops'), 'electronics-laptops'),
                                    TreeNode::make(__('workbench.pages.components.tree.categories.electronics.phones'), 'electronics-phones'),
                                ]),
                            TreeNode::make(__('workbench.pages.components.tree.categories.clothing.label'), 'clothing')
                                ->children([
                                    TreeNode::make(__('workbench.pages.components.tree.categories.clothing.men'), 'clothing-men'),
                                    TreeNode::make(__('workbench.pages.components.tree.categories.clothing.women'), 'clothing-women')
                                        ->href('/components/containers'),
                                ]),
                            TreeNode::make(__('workbench.pages.components.tree.categories.documents.label'), 'documents')
                                ->actions(
                                    ActionGroup::make('tree-documents-actions')
                                        ->actions([
                                            Action::make('tree-documents-rename')->label(__('workbench.pages.components.tree.categories.documents.rename')),
                                            Action::make('tree-documents-archive')->label(__('workbench.pages.components.tree.categories.documents.archive')),
                                        ]),
                                ),
                        ])
                        ->activeId('electronics-phones')
                        ->defaultExpanded(['electronics'])
                        ->rememberState(),
                ]),
        ]);
    }
}
