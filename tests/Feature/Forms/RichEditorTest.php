<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\RichEditor;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Forms\RichContent;
use Lattice\Lattice\Forms\RichEditor\EditorExtension;
use Lattice\Lattice\Forms\RichEditor\Extensions\Bold;
use Lattice\Lattice\Forms\RichEditor\Extensions\Italic;
use Symfony\Component\HttpFoundation\Response;

/**
 * @return array<string, mixed>
 */
function richDocument(): array
{
    return [
        'type' => 'doc',
        'content' => [
            [
                'type' => 'paragraph',
                'content' => [
                    ['type' => 'text', 'text' => 'Hi '],
                    ['type' => 'text', 'text' => 'bold', 'marks' => [['type' => 'bold']]],
                ],
            ],
        ],
    ];
}

it('renders a document to sanitized html', function (): void {
    expect(RichContent::make(richDocument())->toHtml())->toBe('<p>Hi <strong>bold</strong></p>');
});

it('returns empty html for an empty document', function (): void {
    expect(RichContent::make(null)->toHtml())->toBe('')
        ->and(RichContent::make([])->toHtml())->toBe('');
});

it('strips nodes that are not in the schema', function (): void {
    $doc = [
        'type' => 'doc',
        'content' => [
            ['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'ok']]],
            ['type' => 'evilScript', 'attrs' => ['onload' => 'alert(1)']],
        ],
    ];

    expect(RichContent::make($doc)->toHtml())->not->toContain('evilScript')
        ->and(RichContent::make($doc)->toHtml())->not->toContain('onload')
        ->and(json_encode(RichContent::make($doc)->toArray()))->not->toContain('evilScript');
});

it('renders a table to sanitized html', function (): void {
    $doc = [
        'type' => 'doc',
        'content' => [
            [
                'type' => 'table',
                'content' => [
                    [
                        'type' => 'tableRow',
                        'content' => [
                            ['type' => 'tableHeader', 'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Name']]]]],
                            ['type' => 'tableHeader', 'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Age']]]]],
                        ],
                    ],
                    [
                        'type' => 'tableRow',
                        'content' => [
                            ['type' => 'tableCell', 'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Ada']]]]],
                            ['type' => 'tableCell', 'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => '36']]]]],
                        ],
                    ],
                ],
            ],
        ],
    ];

    $html = RichContent::make($doc)->toHtml();

    expect($html)->toContain('<table>')
        ->and($html)->toContain('<th')
        ->and($html)->toContain('Ada');
});

it('renders a details block to sanitized html', function (): void {
    $doc = [
        'type' => 'doc',
        'content' => [
            [
                'type' => 'details',
                'content' => [
                    ['type' => 'detailsSummary', 'content' => [['type' => 'text', 'text' => 'More']]],
                    ['type' => 'detailsContent', 'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Hidden']]]]],
                ],
            ],
        ],
    ];

    $html = RichContent::make($doc)->toHtml();

    expect($html)->toContain('<details')
        ->and($html)->toContain('<summary>More</summary>')
        ->and($html)->toContain('Hidden');
});

it('renders underline, highlight and text alignment', function (): void {
    $doc = [
        'type' => 'doc',
        'content' => [
            [
                'type' => 'paragraph',
                'attrs' => ['textAlign' => 'center'],
                'content' => [
                    ['type' => 'text', 'text' => 'under', 'marks' => [['type' => 'underline']]],
                    ['type' => 'text', 'text' => 'mark', 'marks' => [['type' => 'highlight']]],
                ],
            ],
        ],
    ];

    $html = RichContent::make($doc)->toHtml();

    expect($html)->toContain('<u>under</u>')
        ->and($html)->toContain('<mark>mark</mark>')
        ->and($html)->toContain('text-align: center');
});

it('preserves tables and details through toArray', function (): void {
    $doc = [
        'type' => 'doc',
        'content' => [
            [
                'type' => 'table',
                'content' => [
                    [
                        'type' => 'tableRow',
                        'content' => [
                            ['type' => 'tableCell', 'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'cell']]]]],
                        ],
                    ],
                ],
            ],
            [
                'type' => 'details',
                'content' => [
                    ['type' => 'detailsSummary', 'content' => [['type' => 'text', 'text' => 'Summary']]],
                    ['type' => 'detailsContent', 'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Body']]]]],
                ],
            ],
        ],
    ];

    $types = array_column(RichContent::make($doc)->toArray()['content'], 'type');

    expect($types)->toBe(['table', 'details']);
});

it('decodes the submitted json document during validation', function (): void {
    $definition = new class extends FormDefinition
    {
        public function definition(Form $form, Request $request): Form
        {
            return $form->schema([
                RichEditor::make('body', 'Body')->rules(['required']),
            ]);
        }

        public function handle(Request $request): Response
        {
            return new Response('ok');
        }
    };

    $validated = $definition->validate(Request::create('/', 'POST', [
        'body' => json_encode(richDocument()),
    ]));

    expect($validated['body'])->toBeArray()
        ->and($validated['body']['type'])->toBe('doc')
        ->and($validated['body']['content'][0]['type'])->toBe('paragraph');
});

it('preserves submitted links during validation', function (): void {
    $definition = new class extends FormDefinition
    {
        public function definition(Form $form, Request $request): Form
        {
            return $form->schema([
                RichEditor::make('body', 'Body')->rules(['required']),
            ]);
        }

        public function handle(Request $request): Response
        {
            return new Response('ok');
        }
    };

    $document = [
        'type' => 'doc',
        'content' => [
            [
                'type' => 'paragraph',
                'content' => [
                    [
                        'type' => 'text',
                        'text' => 'OpenAI',
                        'marks' => [
                            [
                                'type' => 'link',
                                'attrs' => ['href' => 'https://openai.com'],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ];

    $validated = $definition->validate(Request::create('/', 'POST', [
        'body' => json_encode($document),
    ]));

    $html = RichContent::make($validated['body'])->toHtml();

    expect(data_get($validated, 'body.content.0.content.0.marks.0.type'))->toBe('link')
        ->and(data_get($validated, 'body.content.0.content.0.marks.0.attrs.href'))->toBe('https://openai.com')
        ->and($html)->toContain('<a ')
        ->and($html)->toContain('href="https://openai.com"')
        ->and($html)->toContain('OpenAI</a>');
});

it('strips node types outside the active extension set during validation', function (): void {
    $definition = new class extends FormDefinition
    {
        public function definition(Form $form, Request $request): Form
        {
            return $form->schema([
                RichEditor::make('body', 'Body')->rules(['required'])->extensions([
                    Bold::make(),
                    Italic::make(),
                ]),
            ]);
        }

        public function handle(Request $request): Response
        {
            return new Response('ok');
        }
    };

    $document = [
        'type' => 'doc',
        'content' => [
            [
                'type' => 'paragraph',
                'content' => [['type' => 'text', 'text' => 'keep', 'marks' => [['type' => 'bold']]]],
            ],
            [
                'type' => 'heading',
                'attrs' => ['level' => 2],
                'content' => [['type' => 'text', 'text' => 'smuggled']],
            ],
        ],
    ];

    $validated = $definition->validate(Request::create('/', 'POST', [
        'body' => json_encode($document),
    ]));

    $types = array_column($validated['body']['content'], 'type');

    expect($types)->not->toContain('heading')
        ->and(data_get($validated, 'body.content.0.content.0.marks.0.type'))->toBe('bold');
});

it('strips marks outside the active extension set during validation', function (): void {
    $definition = new class extends FormDefinition
    {
        public function definition(Form $form, Request $request): Form
        {
            return $form->schema([
                RichEditor::make('body', 'Body')->rules(['required'])->extensions([
                    Bold::make(),
                ]),
            ]);
        }

        public function handle(Request $request): Response
        {
            return new Response('ok');
        }
    };

    $document = [
        'type' => 'doc',
        'content' => [
            [
                'type' => 'paragraph',
                'content' => [
                    [
                        'type' => 'text',
                        'text' => 'linked',
                        'marks' => [['type' => 'link', 'attrs' => ['href' => 'https://example.com']]],
                    ],
                ],
            ],
        ],
    ];

    $validated = $definition->validate(Request::create('/', 'POST', [
        'body' => json_encode($document),
    ]));

    expect(data_get($validated, 'body.content.0.content.0.text'))->toBe('linked')
        ->and(data_get($validated, 'body.content.0.content.0.marks'))->toBeNull();
});

it('keeps the full document for the default extension set', function (): void {
    $definition = new class extends FormDefinition
    {
        public function definition(Form $form, Request $request): Form
        {
            return $form->schema([
                RichEditor::make('body', 'Body')->rules(['required']),
            ]);
        }

        public function handle(Request $request): Response
        {
            return new Response('ok');
        }
    };

    $document = [
        'type' => 'doc',
        'content' => [
            ['type' => 'heading', 'attrs' => ['level' => 3], 'content' => [['type' => 'text', 'text' => 'Title']]],
            [
                'type' => 'table',
                'content' => [
                    [
                        'type' => 'tableRow',
                        'content' => [
                            ['type' => 'tableCell', 'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'cell']]]]],
                        ],
                    ],
                ],
            ],
            [
                'type' => 'details',
                'content' => [
                    ['type' => 'detailsSummary', 'content' => [['type' => 'text', 'text' => 'More']]],
                    ['type' => 'detailsContent', 'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Body']]]]],
                ],
            ],
        ],
    ];

    $validated = $definition->validate(Request::create('/', 'POST', [
        'body' => json_encode($document),
    ]));

    expect(array_column($validated['body']['content'], 'type'))->toBe(['heading', 'table', 'details']);
});

it('strips nodes of client-only extension types during validation', function (): void {
    $definition = new class extends FormDefinition
    {
        public function definition(Form $form, Request $request): Form
        {
            return $form->schema([
                RichEditor::make('body', 'Body')->rules(['required'])->extensions([
                    Bold::make(),
                    'mention',
                ]),
            ]);
        }

        public function handle(Request $request): Response
        {
            return new Response('ok');
        }
    };

    $document = [
        'type' => 'doc',
        'content' => [
            [
                'type' => 'paragraph',
                'content' => [
                    ['type' => 'text', 'text' => 'hi '],
                    ['type' => 'mention', 'attrs' => ['id' => '7']],
                ],
            ],
        ],
    ];

    $validated = $definition->validate(Request::create('/', 'POST', [
        'body' => json_encode($document),
    ]));

    expect(json_encode($validated['body']))->not->toContain('mention');
});

it('keeps nodes of a custom extension that declares their server types', function (): void {
    $definition = new class extends FormDefinition
    {
        public function definition(Form $form, Request $request): Form
        {
            return $form->schema([
                RichEditor::make('body', 'Body')->rules(['required'])->extensions([
                    Bold::make(),
                    new class extends EditorExtension
                    {
                        protected array $serverTypes = ['mention'];

                        #[Override]
                        public function wireType(): string
                        {
                            return 'mention';
                        }
                    },
                ]),
            ]);
        }

        public function handle(Request $request): Response
        {
            return new Response('ok');
        }
    };

    $document = [
        'type' => 'doc',
        'content' => [
            [
                'type' => 'paragraph',
                'content' => [
                    ['type' => 'text', 'text' => 'hi '],
                    ['type' => 'mention', 'attrs' => ['id' => '7']],
                ],
            ],
        ],
    ];

    $validated = $definition->validate(Request::create('/', 'POST', [
        'body' => json_encode($document),
    ]));

    expect(data_get($validated, 'body.content.0.content.1.type'))->toBe('mention');
});
