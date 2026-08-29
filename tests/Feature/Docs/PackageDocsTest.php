<?php

declare(strict_types=1);

use Illuminate\Support\Facades\File;
use Lattice\Board\BoardColumn;
use Lattice\Board\BoardColumnCards;
use Lattice\Board\BoardResult;
use Lattice\Board\Components\Board;
use Lattice\Chat\Components\ChatBox;
use Lattice\Core\Enums\ColorName;
use Lattice\Core\Support\Wire;
use Lattice\Map\Components\Map;
use Lattice\Map\Marker;
use Lattice\Map\Route;
use Lattice\Media\Components\MediaLibrary;
use Lattice\Media\Forms\Components\MediaPicker;
use Lattice\Pdf\Components\PdfViewer;
use Lattice\Table\Components\Table;
use Lattice\Table\TableQuery;
use Lattice\Table\TableResult;
use Lattice\Tree\Tree;
use Lattice\Tree\TreeNode;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\Gap;

describe('package docs fixtures', function (): void {
    it('matches the board example fixture', function (): void {
        assertFixtureMatches('packages.board', Wire::toWire([
            Board::make('sprint')
                ->columns([
                    BoardColumn::make('backlog')->label('Backlog')->color('gray')->data(),
                    BoardColumn::make('doing')->label('In Progress')->color('blue')->data(),
                    BoardColumn::make('done')->label('Done')->color('green')->data(),
                ])
                ->schema([
                    Stack::make()->gap(Gap::ExtraSmall)->schema([
                        Text::make('')->dataKey('text', 'title'),
                        Text::make('')->dataKey('text', 'assignee'),
                    ]),
                ])
                ->result(BoardResult::make([
                    new BoardColumnCards('backlog', [
                        ['assignee' => 'Mina', 'id' => 1, 'title' => 'Design onboarding flow'],
                    ], 4, true, 1),
                    new BoardColumnCards('doing', [
                        ['assignee' => 'Theo', 'id' => 2, 'title' => 'Wire up billing webhook'],
                    ], 1, false, 1),
                    new BoardColumnCards('done', [
                        ['assignee' => 'Priya', 'id' => 3, 'title' => 'Migrate avatars to S3'],
                    ], 1, false, 1),
                ])),
        ]));
    });

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

    it('matches the map routes example fixture', function (): void {
        assertFixtureMatches('packages.map-routes', Wire::toWire([
            Map::make('commute')
                ->height(360)
                ->routes([
                    Route::make('berlin-potsdam')
                        ->path([
                            [52.5200, 13.4050],
                            [52.5063, 13.3320],
                            [52.4581, 13.2107],
                            [52.3989, 13.0657],
                        ])
                        ->color(ColorName::Info)
                        ->weight(4),
                ])
                ->markers([
                    Marker::make('berlin')
                        ->position(52.5200, 13.4050)
                        ->label('Berlin office'),
                    Marker::make('potsdam')
                        ->position(52.3989, 13.0657)
                        ->label('Potsdam office'),
                ]),
        ]));
    });

    it('matches the media example fixture', function (): void {
        assertFixtureMatches('packages.media', Wire::toWire([
            MediaPicker::make('gallery', 'Product gallery')
                ->multiple()
                ->maxFiles(3)
                ->schema([
                    MediaLibrary::make('gallery-library')->picker()->schema([
                        Table::make('gallery-media')->result(
                            TableResult::fromItems(collect([
                                [
                                    'id' => 1,
                                    'url' => 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
                                    'preview_url' => 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=480&q=80',
                                    'name' => 'workspace.jpg',
                                    'mime_type' => 'image/jpeg',
                                    'size' => 248_320,
                                    'alt' => 'A bright workspace with plants',
                                    'created_at' => '2026-08-12T09:15:00+00:00',
                                    'attachments_count' => 2,
                                ],
                                [
                                    'id' => 2,
                                    'url' => 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
                                    'preview_url' => 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=480&q=80',
                                    'name' => 'studio.jpg',
                                    'mime_type' => 'image/jpeg',
                                    'size' => 315_904,
                                    'alt' => 'A modern studio interior',
                                    'created_at' => '2026-08-11T14:40:00+00:00',
                                    'attachments_count' => 1,
                                ],
                                [
                                    'id' => 3,
                                    'url' => null,
                                    'preview_url' => null,
                                    'name' => 'brand-guidelines.pdf',
                                    'mime_type' => 'application/pdf',
                                    'size' => 1_843_200,
                                    'alt' => null,
                                    'created_at' => '2026-08-10T08:05:00+00:00',
                                    'attachments_count' => 4,
                                ],
                                [
                                    'id' => 4,
                                    'url' => null,
                                    'preview_url' => null,
                                    'name' => 'launch-film.mp4',
                                    'mime_type' => 'video/mp4',
                                    'size' => 8_294_400,
                                    'alt' => null,
                                    'created_at' => '2026-08-09T16:20:00+00:00',
                                    'attachments_count' => 0,
                                ],
                            ])),
                            TableQuery::empty(),
                        ),
                    ]),
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
