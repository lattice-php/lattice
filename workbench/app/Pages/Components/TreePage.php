<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Components;

use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Actions\Components\ActionGroup;
use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Ui\Components\Heading;
use Lattice\Lattice\Ui\Components\Modal;
use Lattice\Lattice\Ui\Components\Stack;
use Lattice\Lattice\Ui\Components\Text;
use Lattice\Lattice\Ui\Components\Tree;
use Lattice\Lattice\Ui\Enums\Gap;
use Lattice\Lattice\Ui\Values\TreeNode;
use Workbench\App\Actions\ShowTreeNodeInfoAction;
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
                                    TreeNode::make(__('workbench.pages.components.tree.categories.electronics.tablets'), 'electronics-tablets'),
                                    TreeNode::make(__('workbench.pages.components.tree.categories.electronics.accessories.label'), 'electronics-accessories')
                                        ->children([
                                            TreeNode::make(__('workbench.pages.components.tree.categories.electronics.accessories.cases'), 'electronics-accessories-cases'),
                                            TreeNode::make(__('workbench.pages.components.tree.categories.electronics.accessories.chargers'), 'electronics-accessories-chargers'),
                                        ]),
                                ]),
                            TreeNode::make(__('workbench.pages.components.tree.categories.clothing.label'), 'clothing')
                                ->children([
                                    TreeNode::make(__('workbench.pages.components.tree.categories.clothing.men'), 'clothing-men'),
                                    TreeNode::make(__('workbench.pages.components.tree.categories.clothing.women'), 'clothing-women')
                                        ->href('/components/containers'),
                                    TreeNode::make(__('workbench.pages.components.tree.categories.clothing.kids'), 'clothing-kids'),
                                    TreeNode::make(__('workbench.pages.components.tree.categories.clothing.accessories.label'), 'clothing-accessories')
                                        ->children([
                                            TreeNode::make(__('workbench.pages.components.tree.categories.clothing.accessories.belts'), 'clothing-accessories-belts'),
                                            TreeNode::make(__('workbench.pages.components.tree.categories.clothing.accessories.hats'), 'clothing-accessories-hats'),
                                        ]),
                                ]),
                            TreeNode::make(__('workbench.pages.components.tree.categories.documents.label'), 'documents')
                                ->actions(
                                    ActionGroup::make('tree-documents-actions')
                                        ->actions([
                                            Action::make('tree-documents-rename')->label(__('workbench.pages.components.tree.categories.documents.rename')),
                                            Action::make('tree-documents-archive')->label(__('workbench.pages.components.tree.categories.documents.archive')),
                                        ]),
                                ),
                            TreeNode::make(__('workbench.pages.components.tree.categories.furniture.label'), 'furniture')
                                ->children([
                                    TreeNode::make(__('workbench.pages.components.tree.categories.furniture.living-room.label'), 'furniture-living-room')
                                        ->children([
                                            TreeNode::make(__('workbench.pages.components.tree.categories.furniture.living-room.sofas'), 'furniture-living-room-sofas'),
                                            TreeNode::make(__('workbench.pages.components.tree.categories.furniture.living-room.coffee-tables'), 'furniture-living-room-coffee-tables'),
                                        ]),
                                    TreeNode::make(__('workbench.pages.components.tree.categories.furniture.bedroom.label'), 'furniture-bedroom')
                                        ->children([
                                            TreeNode::make(__('workbench.pages.components.tree.categories.furniture.bedroom.beds'), 'furniture-bedroom-beds'),
                                            TreeNode::make(__('workbench.pages.components.tree.categories.furniture.bedroom.wardrobes'), 'furniture-bedroom-wardrobes'),
                                        ]),
                                ]),
                            TreeNode::make(__('workbench.pages.components.tree.categories.groceries.label'), 'groceries')
                                ->children([
                                    TreeNode::make(__('workbench.pages.components.tree.categories.groceries.produce'), 'groceries-produce'),
                                    TreeNode::make(__('workbench.pages.components.tree.categories.groceries.dairy'), 'groceries-dairy'),
                                    TreeNode::make(__('workbench.pages.components.tree.categories.groceries.bakery'), 'groceries-bakery'),
                                    TreeNode::make(__('workbench.pages.components.tree.categories.groceries.frozen'), 'groceries-frozen'),
                                ]),
                            TreeNode::make(__('workbench.pages.components.tree.categories.automotive.label'), 'automotive')
                                ->children([
                                    TreeNode::make(__('workbench.pages.components.tree.categories.automotive.parts.label'), 'automotive-parts')
                                        ->children([
                                            TreeNode::make(__('workbench.pages.components.tree.categories.automotive.parts.engine'), 'automotive-parts-engine'),
                                            TreeNode::make(__('workbench.pages.components.tree.categories.automotive.parts.brakes'), 'automotive-parts-brakes'),
                                        ]),
                                    TreeNode::make(__('workbench.pages.components.tree.categories.automotive.accessories.label'), 'automotive-accessories')
                                        ->children([
                                            TreeNode::make(__('workbench.pages.components.tree.categories.automotive.accessories.seat-covers'), 'automotive-accessories-seat-covers'),
                                            TreeNode::make(__('workbench.pages.components.tree.categories.automotive.accessories.floor-mats'), 'automotive-accessories-floor-mats'),
                                        ]),
                                ]),
                            TreeNode::make(__('workbench.pages.components.tree.categories.help.label'), 'help')
                                ->action(Action::use(ShowTreeNodeInfoAction::class)),
                        ])
                        ->activeId('electronics-phones')
                        ->defaultExpanded(['electronics', 'furniture'])
                        ->rememberState(),
                    Modal::make('tree-node-info')
                        ->title(__('workbench.pages.components.tree.info-modal.title'))
                        ->description(__('workbench.pages.components.tree.info-modal.description'))
                        ->schema([
                            Text::make(__('workbench.pages.components.tree.info-modal.body')),
                        ]),
                ]),
        ]);
    }
}
