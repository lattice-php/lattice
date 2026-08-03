<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Actions\Components\ActionGroup;
use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Ui\Components\Heading;
use Lattice\Lattice\Ui\Components\Modal;
use Lattice\Lattice\Ui\Components\Stack;
use Lattice\Lattice\Ui\Components\Text;
use Lattice\Lattice\Ui\Enums\Gap;
use Lattice\Tree\Tree;
use Lattice\Tree\TreeNode;
use Workbench\App\Actions\ShowTreeNodeInfoAction;

#[AsPage(route: '/tree')]
final class TreePage extends WorkbenchPage
{
    public function title(): string
    {
        return 'Tree';
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('tree-page')
                ->gap(Gap::ExtraLarge)
                ->schema([
                    Heading::make($this->title()),
                    Text::make('A hierarchy rendered by the lattice-php/tree component package.'),
                    Tree::make('demo-tree')
                        ->nodes([
                            TreeNode::make('electronics', 'Electronics')
                                ->children([
                                    TreeNode::make('electronics-laptops', 'Laptops'),
                                    TreeNode::make('electronics-phones', 'Phones'),
                                    TreeNode::make('electronics-accessories', 'Accessories')
                                        ->children([
                                            TreeNode::make('electronics-accessories-cases', 'Cases'),
                                            TreeNode::make('electronics-accessories-chargers', 'Chargers'),
                                        ]),
                                ]),
                            TreeNode::make('clothing', 'Clothing')
                                ->children([
                                    TreeNode::make('clothing-men', 'Men'),
                                    TreeNode::make('clothing-women', 'Women')->href('/plain'),
                                    TreeNode::make('clothing-kids', 'Kids')->badge('New', 'blue'),
                                ]),
                            TreeNode::make('documents', 'Documents')
                                ->actions(
                                    ActionGroup::make('tree-documents-actions')
                                        ->actions([
                                            Action::make('tree-documents-rename')->label('Rename'),
                                            Action::make('tree-documents-archive')->label('Archive'),
                                        ]),
                                ),
                            TreeNode::make('furniture', 'Furniture')
                                ->children([
                                    TreeNode::make('furniture-sofas', 'Sofas'),
                                    TreeNode::make('furniture-beds', 'Beds'),
                                ]),
                            TreeNode::make('help', 'Help')
                                ->action(Action::use(ShowTreeNodeInfoAction::class)),
                        ])
                        ->activeId('electronics-phones')
                        ->defaultExpanded(['electronics', 'furniture'])
                        ->rememberState(),
                    Modal::make('tree-node-info')
                        ->title('Node info')
                        ->description('Details about the selected node.')
                        ->schema([
                            Text::make('This modal was opened from a tree node action.'),
                        ]),
                ]),
        ]);
    }
}
