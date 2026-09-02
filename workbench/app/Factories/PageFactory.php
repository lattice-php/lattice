<?php
declare(strict_types=1);

namespace Workbench\App\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Lattice\Blocks\BlockDocument;
use Lattice\Blocks\BlockNode;
use Workbench\App\Models\Page;

/** @extends Factory<Page> */
class PageFactory extends Factory
{
    protected $model = Page::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        $title = fake()->unique()->sentence(3);

        return [
            'title' => Str::headline($title),
            'slug' => Str::slug($title),
            'draft' => null,
            'published' => null,
            'revision' => 0,
        ];
    }

    public function withDraft(BlockDocument $document): static
    {
        return $this->state(['draft' => $document, 'revision' => 1]);
    }

    public function sample(): static
    {
        return $this->withDraft(new BlockDocument([
            BlockNode::make('workbench.hero', [
                'title' => 'Order processing that grows with you',
                'intro' => ['type' => 'doc', 'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'From quote to invoice in one flow.']]]]],
                'button_label' => 'Book a demo',
                'button_target' => '/demo',
            ], id: 'b_hero'),
            BlockNode::make('lattice.paragraph', [
                'content' => ['type' => 'doc', 'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Teams lose most of their time searching, not typing.']]]]],
            ], id: 'b_intro'),
            BlockNode::make('lattice.columns', ['count' => '2'], [
                'col_1' => [BlockNode::make('lattice.heading', ['text' => 'Pick on the go', 'level' => '3'], id: 'b_col1_heading')],
                'col_2' => [BlockNode::make('lattice.paragraph', [
                    'content' => ['type' => 'doc', 'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Scanner, tablet or phone.']]]]],
                ], id: 'b_col2_text')],
            ], id: 'b_columns'),
            BlockNode::make('workbench.cta', ['title' => 'Ready for a test run?', 'text' => '14 days, no credit card.', 'button_label' => 'Create account'], id: 'b_cta'),
        ]));
    }
}
