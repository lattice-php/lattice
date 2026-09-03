<?php
declare(strict_types=1);

namespace Lattice\Blocks\Builtin;

use Illuminate\Contracts\View\View;
use Illuminate\Support\HtmlString;
use Lattice\Blocks\Attributes\AsBlock;
use Lattice\Blocks\BlockData;
use Lattice\Blocks\BlockDefinition;
use Lattice\Blocks\BlockSlots;
use Lattice\Blocks\Enums\BlockCategory;
use Lattice\Blocks\Slot;
use Lattice\Form\Components\Select;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Components\Grid;
use Lattice\Ui\Enums\Icon;

#[AsBlock('lattice.columns', label: 'Columns', icon: Icon::Columns2, category: BlockCategory::Layout, description: 'Two to four side-by-side columns.', keywords: ['grid', 'layout', 'side by side'])]
final class ColumnsBlock extends BlockDefinition
{
    public const int MAX = 4;

    public function fields(): array
    {
        return [
            Select::make('count', __('blocks::blocks.fields.columns'))->options(['2' => '2', '3' => '3', '4' => '4'])->value('2'),
        ];
    }

    public function slots(?array $data = null): array
    {
        $count = $data === null ? self::MAX : $this->count($data);

        return array_map(
            static fn (int $index): Slot => Slot::make("col_{$index}")->label(__('blocks::blocks.slots.column', ['index' => $index])),
            range(1, $count),
        );
    }

    public function render(BlockData $data, BlockSlots $slots): Grid
    {
        $count = $this->count($data->all());

        return Grid::make()->columns($count)->schema(array_map(
            static fn (int $index): Component => $slots->render("col_{$index}"),
            range(1, $count),
        ));
    }

    public function html(BlockData $data, BlockSlots $slots): View
    {
        $count = $this->count($data->all());

        return view('blocks::blocks.columns', [
            'count' => $count,
            'columns' => array_map(static fn (int $index): HtmlString => $slots->html("col_{$index}"), range(1, $count)),
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function count(array $data): int
    {
        return max(2, min(self::MAX, (int) ($data['count'] ?? 2)));
    }
}
