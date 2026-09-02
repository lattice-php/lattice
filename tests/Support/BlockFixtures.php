<?php
declare(strict_types=1);

use Lattice\Blocks\BlockDocument;
use Lattice\Blocks\BlockNode;
use Workbench\App\Models\Page;

/**
 * A heading above a two-column block holding one paragraph per column — the
 * shape the renderer, validator, and endpoint tests all assert against.
 */
function sampleBlockDocument(): BlockDocument
{
    return new BlockDocument([
        BlockNode::make('lattice.heading', ['text' => 'Welcome', 'level' => '2'], id: 'b_heading'),
        BlockNode::make('lattice.columns', ['count' => '2'], [
            'col_1' => [BlockNode::make('lattice.paragraph', ['content' => richParagraph('Left')], id: 'b_left')],
            'col_2' => [BlockNode::make('lattice.paragraph', ['content' => richParagraph('Right')], id: 'b_right')],
        ], id: 'b_columns'),
    ]);
}

/**
 * @return array<string, mixed>
 */
function richParagraph(string $text): array
{
    return ['type' => 'doc', 'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => $text]]]]];
}

function pageWithDraft(?BlockDocument $document = null): Page
{
    return Page::factory()->withDraft($document ?? sampleBlockDocument())->create(['title' => 'Landing', 'slug' => 'landing']);
}
