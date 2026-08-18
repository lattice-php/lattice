<?php

declare(strict_types=1);

use Illuminate\Support\Facades\File;
use Lattice\Chat\Components\ChatBox;
use Lattice\Core\Enums\ColorName;
use Lattice\Core\Support\Wire;
use Lattice\Map\Components\Map;
use Lattice\Map\Marker;
use Lattice\Pdf\Components\PdfViewer;
use Lattice\Tree\Tree;
use Lattice\Tree\TreeNode;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\Gap;

describe('package docs fixtures', function (): void {
    it('matches the chat example fixture', function (): void {
        assertFixtureMatches('packages.chat', Wire::toWire([
            ChatBox::make('assistant')
                ->title('Lattice assistant')
                ->placeholder('Ask about your project'),
        ]));
    });

    it('matches the map example fixture', function (): void {
        assertFixtureMatches('packages.map', Wire::toWire([
            Map::make('offices')
                ->height(360)
                ->markers([
                    Marker::make('berlin')
                        ->position(52.5200, 13.4050)
                        ->label('Berlin office')
                        ->popup([
                            Stack::make()->gap(Gap::Small)->schema([
                                Heading::make('Berlin office', 3),
                                Text::make('Alexanderplatz 1'),
                            ]),
                        ])
                        ->open(),
                    Marker::make('hamburg')
                        ->position(53.5511, 9.9937)
                        ->label('Hamburg office')
                        ->color(ColorName::Warning),
                ]),
        ]));
    });

    it('matches the pdf example fixture', function (): void {
        $pdfPackage = File::json(dirname(__DIR__, 3).'/packages/pdf/package.json');
        $pdfJsVersion = $pdfPackage['dependencies']['pdfjs-dist'] ?? null;

        if (! is_string($pdfJsVersion)) {
            throw new RuntimeException('The PDF package must declare a pdfjs-dist version.');
        }

        config()->set(
            'pdf.worker_url',
            "https://cdn.jsdelivr.net/npm/pdfjs-dist@{$pdfJsVersion}/build/pdf.worker.min.mjs",
        );

        assertFixtureMatches('packages.pdf', Wire::toWire([
            PdfViewer::make('manual')
                ->url('https://raw.githubusercontent.com/lattice-php/lattice/main/workbench/fixtures/sample.pdf')
                ->filename('sample.pdf')
                ->maxHeight(480),
        ]));
    });

    it('matches the tree example fixture', function (): void {
        assertFixtureMatches('packages.tree', Wire::toWire([
            Tree::make('catalog')->nodes([
                TreeNode::make('products', 'Products')
                    ->badge('24', ColorName::Info)
                    ->children([
                        TreeNode::make('hardware', 'Hardware')->children([
                            TreeNode::make('laptops', 'Laptops'),
                            TreeNode::make('phones', 'Phones'),
                        ]),
                        TreeNode::make('software', 'Software'),
                    ]),
                TreeNode::make('services', 'Services')->badge('8'),
            ])->defaultExpanded(['products', 'hardware']),
        ]));
    });
});
