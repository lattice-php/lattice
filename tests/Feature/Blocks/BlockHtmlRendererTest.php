<?php
declare(strict_types=1);

use Lattice\Blocks\Attributes\AsBlock;
use Lattice\Blocks\BlockData;
use Lattice\Blocks\BlockDefinition;
use Lattice\Blocks\BlockDocument;
use Lattice\Blocks\BlockHtmlRenderer;
use Lattice\Blocks\BlockNode;
use Lattice\Blocks\BlockRegistry;
use Lattice\Blocks\BlockSlots;
use Lattice\Blocks\BlockStyle;
use Lattice\Blocks\Enums\BlockBackground;
use Lattice\Blocks\Enums\BlockWidth;
use Lattice\Blocks\Exceptions\MissingHtmlRenderer;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\Enums\TextAlign;

#[AsBlock('test.no-html', label: 'No HTML')]
final class NoHtmlBlock extends BlockDefinition
{
    public function fields(): array
    {
        return [];
    }

    public function render(BlockData $data, BlockSlots $slots): Text
    {
        return Text::make('canvas only');
    }
}

function renderHtml(BlockDocument $document): string
{
    return app(BlockHtmlRenderer::class)->render($document)->toHtml();
}

it('renders the built-in text blocks as semantic HTML inside styled frames', function (): void {
    $html = renderHtml(new BlockDocument([
        new BlockNode('b_h', 'lattice.heading', ['text' => 'Welcome <3', 'level' => '2'], new BlockStyle(width: BlockWidth::Content, anchor: 'top')),
        BlockNode::make('lattice.paragraph', ['content' => richParagraph('Body copy')]),
        BlockNode::make('lattice.quote', ['quote' => 'Less is more.', 'cite' => 'Mies']),
        BlockNode::make('lattice.list', ['content' => [
            'type' => 'doc',
            'content' => [['type' => 'bulletList', 'content' => [['type' => 'listItem', 'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'First']]]]]]]],
        ]]),
        BlockNode::make('lattice.separator'),
        BlockNode::make('lattice.spacer', ['size' => 'lg']),
    ]));

    expect($html)
        ->toContain('<h2 class="lt-blocks-heading">Welcome &lt;3</h2>')
        ->toContain('id="top"')
        ->toContain('data-block-type="lattice.heading"')
        ->toContain('class="mx-auto w-full max-w-3xl"')
        ->toContain('<p>Body copy</p>')
        ->toContain('<blockquote')
        ->toContain('<cite>Mies</cite>')
        ->toContain('<ul')
        ->toContain('First')
        ->toContain('<hr class="lt-blocks-separator')
        ->toContain('lt-blocks-spacer h-16');
});

it('nests slot children in layout blocks and skips blocks that render nothing', function (): void {
    $html = renderHtml(new BlockDocument([
        BlockNode::make('lattice.section', ['title' => 'Details'], [
            'content' => [
                BlockNode::make('lattice.columns', ['count' => '3'], [
                    'col_1' => [BlockNode::make('lattice.paragraph', ['content' => richParagraph('Left')])],
                    'col_2' => [BlockNode::make('lattice.paragraph')],
                    'col_3' => [BlockNode::make('lattice.heading', ['text' => ''])],
                ]),
            ],
        ]),
    ]));

    expect($html)
        ->toContain('<h2 class="lt-blocks-heading">Details</h2>')
        ->toContain('md:grid-cols-3')
        ->toContain('<p>Left</p>')
        ->not->toContain('data-block-type="lattice.heading"')
        ->and(substr_count($html, 'data-block-type="lattice.paragraph"'))->toBe(1);
});

it('maps the block style onto frame classes and lets the configured map override them', function (): void {
    $node = new BlockNode('b_p', 'lattice.paragraph', ['content' => richParagraph('Styled')], new BlockStyle(
        width: BlockWidth::Wide,
        paddingTop: Gap::Large,
        marginBottom: Gap::Small,
        background: BlockBackground::Muted,
        align: TextAlign::Center,
        hideOnMobile: true,
    ));

    expect($node->style->classes())->toBe([
        'outer' => 'mb-4 pt-12 bg-lt-muted text-lt-fg px-6 max-md:hidden text-center',
        'inner' => 'mx-auto w-full max-w-6xl',
    ]);

    config()->set('lattice.blocks.style_classes', [
        'background' => ['muted' => 'theme-muted'],
        'backgroundPadding' => '',
        'width' => ['wide' => 'container-wide'],
    ]);

    expect(renderHtml(new BlockDocument([$node])))
        ->toContain('class="lt-blocks-frame mb-4 pt-12 theme-muted max-md:hidden text-center"')
        ->toContain('class="container-wide"');
});

it('throws for a block without html() unless a fallback is configured', function (): void {
    app(BlockRegistry::class)->register(NoHtmlBlock::class);
    $document = new BlockDocument([BlockNode::make('test.no-html', id: 'b_x')]);

    expect(fn (): string => renderHtml($document))->toThrow(MissingHtmlRenderer::class, 'test.no-html');

    config()->set('lattice.blocks.html_fallback', static fn (BlockNode $node): string => "<!-- {$node->type} -->");

    expect(renderHtml($document))->toContain('<!-- test.no-html -->');
});

it('uses the fallback for stored blocks whose type is no longer registered', function (): void {
    config()->set('lattice.blocks.html_fallback', static fn (BlockNode $node): string => "<div data-missing=\"{$node->type}\"></div>");

    expect(renderHtml(new BlockDocument([BlockNode::make('gone.block')])))->toContain('data-missing="gone.block"');
});
