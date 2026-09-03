<?php
declare(strict_types=1);

use Lattice\Blocks\BlockDocument;
use Lattice\Blocks\BlockNode;
use Workbench\App\Models\Page;

it('serves the published document as HTML and never the newer draft', function (): void {
    $page = Page::factory()->create([
        'title' => 'Landing',
        'slug' => 'landing',
        'revision' => 3,
        'published' => new BlockDocument([
            BlockNode::make('workbench.hero', ['title' => 'Published headline', 'button_label' => 'Book a demo', 'button_target' => '/demo']),
            BlockNode::make('lattice.paragraph', ['content' => richParagraph('Published body')]),
        ]),
        'draft' => new BlockDocument([
            BlockNode::make('lattice.heading', ['text' => 'Draft only headline', 'level' => '2']),
        ]),
    ]);

    $browser = visit("/p/{$page->slug}");

    assertSeeEventually($browser, 'Published headline');
    $browser->assertSee('Published body')
        ->assertSee('Book a demo')
        ->assertDontSee('Draft only headline')
        ->assertNoJavaScriptErrors();
});

it('responds with 404 while a page has no published document', function (): void {
    $page = pageWithDraft();

    $this->get("/p/{$page->slug}")->assertNotFound();
});
