<?php
declare(strict_types=1);

use Illuminate\Support\Collection;
use Lattice\Chat\Components\ChatBox;
use Lattice\Core\Attributes\SerializationHook;
use Lattice\Core\Color;
use Lattice\Core\Support\Affix;
use Lattice\Ui\Components\Avatar;
use Lattice\Ui\Components\Badge;
use Lattice\Ui\Components\Button;
use Lattice\Ui\Components\CodeBlock;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Components\DescriptionList;
use Lattice\Ui\Components\Entries\ComponentEntry;
use Lattice\Ui\Components\Entries\TextEntry;
use Lattice\Ui\Components\FloatingPanel;
use Lattice\Ui\Components\Grid;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Icon as IconComponent;
use Lattice\Ui\Components\Image;
use Lattice\Ui\Components\Link;
use Lattice\Ui\Components\Progress;
use Lattice\Ui\Components\Separator;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\AvatarShape;
use Lattice\Ui\Enums\Breakpoint;
use Lattice\Ui\Enums\CodeBlockLanguage;
use Lattice\Ui\Enums\FloatingPlacement;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\Enums\Icon;
use Lattice\Ui\Enums\Orientation;
use Lattice\Ui\Enums\Size;
use Lattice\Ui\Enums\StackDirection;

test('lattice component factories stay open for extension', function (): void {
    $badgeClass = (new class extends Badge {})::class;
    $badge = $badgeClass::make('Extended badge', 'extended-badge');

    expect($badge::class)->toBe($badgeClass)
        ->and(new ReflectionClass(Badge::class)->isFinal())->toBeFalse();
});

test('avatars serialize their source, name, shape, and size with sensible defaults', function (): void {
    expect(wire(Avatar::make()))
        ->toMatchArray([
            'type' => 'avatar',
            'props' => [
                'src' => null,
                'name' => null,
                'shape' => 'circle',
                'size' => 'md',
            ],
        ]);

    expect(wire(Avatar::make('https://example.test/a.png')
        ->name('Ada Lovelace')
        ->shape(AvatarShape::Rounded)
        ->size(Size::Lg)))
        ->toMatchArray([
            'type' => 'avatar',
            'props' => [
                'src' => 'https://example.test/a.png',
                'name' => 'Ada Lovelace',
                'shape' => 'rounded',
                'size' => 'lg',
            ],
        ]);
});

test('images serialize their source and preview configuration', function (): void {
    expect(wire(Image::make('https://example.test/p.png')))
        ->toMatchArray([
            'type' => 'image',
            'props' => [
                'src' => 'https://example.test/p.png',
                'alt' => null,
                'size' => null,
                'circular' => false,
                'previewable' => true,
            ],
        ]);

    expect(wire(Image::make('https://example.test/p.png')
        ->alt('Product photo')
        ->size(64)
        ->circular()
        ->previewable(false)))
        ->toMatchArray([
            'type' => 'image',
            'props' => [
                'src' => 'https://example.test/p.png',
                'alt' => 'Product photo',
                'size' => 64,
                'circular' => true,
                'previewable' => false,
            ],
        ]);
});

test('headings serialize their copyable flag', function (): void {
    expect(wire(Heading::make('API Key')->copyable())['props'])
        ->toHaveKey('copyable', true)
        ->and(wire(Heading::make('Plain'))['props'])
        ->toHaveKey('copyable', false);
});

test('code blocks serialize their code and presentation configuration', function (): void {
    expect(wire(CodeBlock::make('<?php echo "Hello";')
        ->language(CodeBlockLanguage::Php)
        ->copyable()
        ->lineNumbers()
        ->maxHeight(320)
        ->wrap()))
        ->toMatchArray([
            'type' => 'code-block',
            'props' => [
                'code' => '<?php echo "Hello";',
                'language' => 'php',
                'copyable' => true,
                'lineNumbers' => true,
                'maxHeight' => 320,
                'wrap' => true,
            ],
        ])
        ->and(wire(CodeBlock::make('plain'))['props'])
        ->toMatchArray([
            'language' => 'text',
            'copyable' => false,
            'lineNumbers' => false,
            'maxHeight' => null,
            'wrap' => false,
        ])
        ->and(wire(CodeBlock::bound('snippet'))['props']['dataBindings'])
        ->toBe(['code' => 'snippet']);
});

test('code blocks reject non-positive maximum heights', function (): void {
    CodeBlock::make('plain')->maxHeight(0);
})->throws(InvalidArgumentException::class);

test('separators default to horizontal and serialize their orientation and bleed', function (): void {
    expect(wire(Separator::make()))
        ->toMatchArray([
            'type' => 'separator',
            'props' => ['orientation' => 'horizontal', 'bleed' => false],
        ]);

    expect(wire(Separator::make()->orientation(Orientation::Vertical)->bleed()))
        ->toMatchArray([
            'type' => 'separator',
            'props' => ['orientation' => 'vertical', 'bleed' => true],
        ]);
});

test('floating panels serialize their placement and children', function (): void {
    $payload = wire(FloatingPanel::make('locale-switcher-panel')
        ->label('Language')
        ->placement(FloatingPlacement::TopEnd)
        ->offset(24)
        ->schema([
            Button::make('English')->key('locale-en'),
        ]));

    expect($payload)->toMatchArray([
        'type' => 'floating-panel',
        'key' => 'locale-switcher-panel',
        'props' => [
            'label' => 'Language',
            'placement' => 'top-end',
            'offset' => 24,
            'trigger' => [],
        ],
    ]);
    expect($payload['schema'])->toHaveCount(1)
        ->and($payload['schema'][0]['type'])->toBe('button')
        ->and($payload['schema'][0]['key'])->toBe('locale-en');
});

test('chat boxes serialize their fluent endpoint and presentation configuration', function (): void {
    expect(wire(ChatBox::make('default-assistant'))['props']['fill'])->toBeFalse();

    expect(wire(ChatBox::make('assistant')
        ->streamEndpoint('/chat/stream')
        ->historyEndpoint('/chat/history')
        ->placeholder('Ask anything…')
        ->title('Assistant')
        ->fill()))
        ->toMatchArray([
            'type' => 'chat.box',
            'id' => 'assistant',
            'props' => [
                'streamEndpoint' => '/chat/stream',
                'historyEndpoint' => '/chat/history',
                'placeholder' => 'Ask anything…',
                'title' => 'Assistant',
                'fill' => true,
                'remote' => null,
            ],
        ]);
});

test('components serialize through prioritized hook attributes without child-specific base hooks', function (): void {
    $component = new class extends Component
    {
        protected function type(): string
        {
            return 'hooked';
        }

        /**
         * @param  array<string, mixed>  $data
         * @return array<string, mixed>
         */
        #[SerializationHook(priority: 500)]
        protected function serialiseCustomData(array $data): array
        {
            return [
                ...$data,
                'empty' => [],
                'custom' => 'value',
            ];
        }
    };

    expect(wire($component))
        ->toBe([
            'type' => 'hooked',
            'props' => [],
            'custom' => 'value',
        ]);
});

test('private serialization hooks are ignored', function (): void {
    $component = new class extends Component
    {
        protected function type(): string
        {
            return 'private-hooked';
        }

        /**
         * @param  array<string, mixed>  $data
         * @return array<string, mixed>
         */
        public function privateDataForTest(array $data): array
        {
            return $this->serialisePrivateData($data);
        }

        /**
         * @param  array<string, mixed>  $data
         * @return array<string, mixed>
         */
        #[SerializationHook(priority: 500)]
        private function serialisePrivateData(array $data): array
        {
            return [
                ...$data,
                'private' => 'value',
            ];
        }
    };

    expect(wire($component))->toBe([
        'type' => 'private-hooked',
        'props' => [],
    ])->and($component->privateDataForTest([]))->toBe([
        'private' => 'value',
    ]);
});

test('links and horizontal stacks serialize as separate composable primitives', function (): void {
    expect(wire(Stack::make('prompt')->direction(StackDirection::Row)->gap(Gap::ExtraSmall)->schema([
        Text::make('Need access?'),
        Link::make('Register')->href('/register'),
    ])))
        ->toMatchArray([
            'type' => 'stack',
            'key' => 'prompt',
            'props' => [
                'direction' => 'row',
                'gap' => 'xs',
                'align' => null,
                'width' => null,
                'justify' => null,
                'height' => null,
                'float' => null,
                'sticky' => false,
            ],
            'schema' => [
                [
                    'type' => 'text',
                    'props' => [
                        'text' => 'Need access?',
                        'align' => null,
                        'size' => 'md',
                        'color' => null,
                        'copyable' => false,
                    ],
                ],
                [
                    'type' => 'link',
                    'props' => [
                        'href' => '/register',
                        'label' => 'Register',
                        'method' => null,
                        'tabIndex' => null,
                        'action' => null,
                        'effects' => [],
                        'modal' => null,
                        'icon' => null,
                        'prefix' => null,
                        'suffix' => null,
                    ],
                ],
            ],
        ]);
});

test('links serialize their icon and affixes', function (): void {
    $wire = wire(
        Link::make('Docs')
            ->href('/docs')
            ->icon(Icon::ExternalLink)
            ->prefix(Affix::icon('book-open'))
            ->suffix('new'),
    );

    expect($wire['props'])->toMatchArray([
        'href' => '/docs',
        'icon' => 'external-link',
        'label' => 'Docs',
        'prefix' => ['icon' => 'book-open', 'text' => null],
        'suffix' => ['icon' => null, 'text' => 'new'],
    ]);
});

test('serializes progress bars and circles', function (): void {
    $bar = wire(Progress::bar(72.5)->color(Color::success())->showValue());

    expect($bar['type'])->toBe('progress')
        ->and($bar['props'])->toMatchArray([
            'value' => 72.5,
            'max' => 100.0,
            'shape' => 'bar',
            'showValue' => true,
            'color' => ['kind' => 'named', 'value' => 'success', 'dark' => null],
            'size' => 'md',
        ]);

    $circle = wire(Progress::circle(35)->max(50)->size(Size::Lg));

    expect($circle['props'])->toMatchArray([
        'value' => 35.0,
        'max' => 50.0,
        'shape' => 'circle',
        'showValue' => false,
        'color' => null,
        'size' => 'lg',
    ]);
});

test('bound components serialize identically to the dataKey idiom', function (): void {
    expect(wire(Text::bound('email')))->toEqual(wire(Text::make('')->dataKey('text', 'email')))
        ->and(wire(Badge::bound('sku')))->toEqual(wire(Badge::make('')->dataKey('label', 'sku')))
        ->and(wire(IconComponent::bound('status_icon')))->toEqual(wire(IconComponent::make('')->dataKey('name', 'status_icon')))
        ->and(wire(Image::bound('avatar_url')))->toEqual(wire(Image::make('')->dataKey('src', 'avatar_url')))
        ->and(wire(Heading::bound('title')))->toEqual(wire(Heading::make('')->dataKey('text', 'title')));
});

test('bound accepts an explicit component key', function (): void {
    expect(wire(Text::bound('email', 'contact-email')))
        ->toMatchArray(['key' => 'contact-email']);
});

test('grids normalize bare column values to the md breakpoint', function (): void {
    expect(wire(Grid::make()->columns(3))['props']['columns'])->toBe(['md' => 3])
        ->and(wire(Grid::make()->columns('2fr 1fr 1fr 1fr'))['props']['columns'])->toBe(['md' => '2fr 1fr 1fr 1fr']);
});

test('grids serialize breakpoint column maps as given', function (): void {
    expect(wire(Grid::make()->columns(['default' => 1, 'md' => 2, 'xl' => 4]))['props']['columns'])
        ->toBe(['default' => 1, 'md' => 2, 'xl' => 4]);
});

test('grids reject unknown breakpoints', function (): void {
    Grid::make()->columns(['tablet' => 2]);
})->throws(InvalidArgumentException::class);

test('grids reject non-positive column counts', function (): void {
    Grid::make()->columns(0);
})->throws(InvalidArgumentException::class);

test('components serialize their column span only when set', function (): void {
    expect(wire(Text::make('hello'))['props'])->not->toHaveKey('columnSpan')
        ->and(wire(Text::make('hello')->columnSpan(2))['props']['columnSpan'])->toBe(['md' => 2])
        ->and(wire(Text::make('hello')->columnSpan(['default' => 2, 'xl' => 3]))['props']['columnSpan'])->toBe(['default' => 2, 'xl' => 3]);
});

test('full column spans normalize to the default breakpoint', function (): void {
    expect(wire(Text::make('hello')->columnSpanFull())['props']['columnSpan'])->toBe(['default' => 'full'])
        ->and(wire(Text::make('hello')->columnSpan('full'))['props']['columnSpan'])->toBe(['default' => 'full']);
});

test('column spans reject values that are neither positive integers nor full', function (): void {
    Text::make('hello')->columnSpan('wide');
})->throws(InvalidArgumentException::class);

test('a description list hands array-like and object records to entries without explicit values', function (mixed $record): void {
    $payload = wire(DescriptionList::make('summary')
        ->record($record)
        ->schema([
            TextEntry::make('name'),
            TextEntry::make('profile.email', 'Email'),
            TextEntry::make('email')->value('override@example.test'),
        ]));

    expect($payload['schema'][0]['props']['value'])->toBe('Ada Lovelace')
        ->and($payload['schema'][0]['props'])->not->toHaveKey('dataBindings')
        ->and($payload['schema'][1]['props']['value'])->toBe('ada@example.test')
        ->and($payload['schema'][1]['props'])->not->toHaveKey('dataBindings')
        ->and($payload['schema'][2]['props']['value'])->toBe('override@example.test')
        ->and($payload['schema'][2]['props'])->not->toHaveKey('dataBindings');
})->with([
    'array' => [[
        'name' => 'Ada Lovelace',
        'profile' => ['email' => 'ada@example.test'],
    ]],
    'collection' => [fn (): Collection => collect([
        'name' => 'Ada Lovelace',
        'profile' => collect(['email' => 'ada@example.test']),
    ])],
    'object' => [(object) [
        'name' => 'Ada Lovelace',
        'profile' => (object) ['email' => 'ada@example.test'],
    ]],
]);

test('a description list without a record binds entries to row data', function (): void {
    $payload = wire(DescriptionList::make()->schema([
        TextEntry::make('email'),
        TextEntry::make('email')->dataKey('value', 'profile.email'),
        TextEntry::make('email')->value('fallback@example.test'),
        TextEntry::make('email')
            ->value('fallback@example.test')
            ->dataKey('value', 'profile.email'),
        TextEntry::make('email')
            ->dataKey('description', 'email_hint')
            ->value('resolved@example.test'),
        ComponentEntry::make('status')->value(Text::make('Active')),
    ]));

    expect($payload['schema'][0]['props']['dataBindings'])->toBe(['value' => 'email'])
        ->and($payload['schema'][1]['props']['dataBindings'])->toBe(['value' => 'profile.email'])
        ->and($payload['schema'][2]['props'])->not->toHaveKey('dataBindings')
        ->and($payload['schema'][3]['props']['dataBindings'])->toBe(['value' => 'profile.email'])
        ->and($payload['schema'][4]['props']['dataBindings'])->toBe(['description' => 'email_hint'])
        ->and($payload['schema'][5]['props'])->not->toHaveKey('dataBindings');
});

test('a description list drops to list semantics once an entry can disclose', function (): void {
    $plain = wire(DescriptionList::make('plain')->schema([
        TextEntry::make('name'),
    ]));

    $disclosing = wire(DescriptionList::make('disclosing')->schema([
        TextEntry::make('password')->disclosure([Text::make('Editor')]),
    ]));

    expect($plain['props']['semantic'])->toBe('description-list')
        ->and($disclosing['props']['semantic'])->toBe('list');
});

test('components serialize responsive visibility breakpoints', function (): void {
    $wire = wire(Text::make('Mobile only')->hiddenFrom(Breakpoint::Md));

    expect($wire['props']['hiddenFrom'])->toBe('md')
        ->and($wire['props'])->not->toHaveKey('visibleFrom');

    $wire = wire(Text::make('Desktop only')->visibleFrom(Breakpoint::Lg));

    expect($wire['props']['visibleFrom'])->toBe('lg')
        ->and($wire['props'])->not->toHaveKey('hiddenFrom');

    expect(wire(Text::make('Everywhere'))['props'])
        ->not->toHaveKey('hiddenFrom')
        ->not->toHaveKey('visibleFrom');
});

test('responsive visibility rejects the default breakpoint', function (): void {
    expect(fn (): Text => Text::make('x')->hiddenFrom(Breakpoint::Default))
        ->toThrow(InvalidArgumentException::class);
    expect(fn (): Text => Text::make('x')->visibleFrom(Breakpoint::Default))
        ->toThrow(InvalidArgumentException::class);
});
