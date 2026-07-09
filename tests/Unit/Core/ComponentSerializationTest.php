<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Actions\Components\ActionGroup;
use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Chat\Components\ChatBox;
use Lattice\Lattice\Core\Components\Badge;
use Lattice\Lattice\Core\Components\Button;
use Lattice\Lattice\Core\Components\Card;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\FloatingPanel;
use Lattice\Lattice\Core\Components\Grid;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Link;
use Lattice\Lattice\Core\Components\Modal;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Components\Tab;
use Lattice\Lattice\Core\Components\Tabs;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\ButtonVariant;
use Lattice\Lattice\Core\Enums\FloatingPlacement;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\Enums\Icon;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Forms\Components\Choice;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Fragments\Components\Fragment as FragmentComponent;
use Lattice\Lattice\Http\Page;
use Lattice\Lattice\LatticeRegistry;
use Lattice\Lattice\Support\Affix;
use Lattice\Lattice\Tables\Components\Table;

test('lattice component factories stay open for extension', function (): void {
    $badgeClass = (new class extends Badge {})::class;
    $badge = $badgeClass::make('Extended badge', 'extended-badge');

    expect($badge::class)->toBe($badgeClass)
        ->and(new ReflectionClass(Badge::class)->isFinal())->toBeFalse();
});

test('lattice facade resolves the registry', function (): void {
    expect(Lattice::getFacadeRoot())->toBe(app(LatticeRegistry::class));
});

test('interactive components keep their serialized ids', function (): void {
    expect(wire(Form::make('demo-form')))
        ->toMatchArray([
            'type' => 'form',
            'id' => 'demo-form',
        ])
        ->and(wire(Table::make('demo-table')))
        ->toMatchArray([
            'type' => 'table',
            'id' => 'demo-table',
        ]);
});

test('interactive components seal request context for endpoints', function (): void {
    $form = wire(Form::make('demo-form')
        ->action('/lattice/forms/demo-form')
        ->context(['team' => 'lattice-core']));
    $table = wire(Table::make('demo-table')
        ->endpoint('/lattice/tables/demo-table')
        ->context(['team' => 'lattice-core']));

    expect($form)
        ->toMatchArray([
            'type' => 'form',
            'id' => 'demo-form',
        ])
        ->and($form['props'])->toHaveKey('ref')
        ->and($form['props'])->not->toHaveKey('context')
        ->and($table)
        ->toMatchArray([
            'type' => 'table',
            'id' => 'demo-table',
        ])
        ->and($table['props'])->toHaveKey('ref')
        ->and($table['props'])->not->toHaveKey('context');
});

function exposesSchemaApi(object $component): bool
{
    return method_exists($component, 'schema');
}

test('only container components expose a schema', function (): void {
    $containerComponents = [
        Card::make('Card', 'Description'),
        FloatingPanel::make('locale-switcher-panel'),
        Grid::make(),
        Stack::make(),
        FragmentComponent::make('fragment'),
        Modal::make('modal'),
        Form::make('profile-form'),
        ActionGroup::make('row-actions'),
        Tab::make('profile', 'Profile'),
        Tabs::make(),
    ];

    $leafComponents = [
        Badge::make('Badge'),
        Button::make('Button'),
        Heading::make('Heading'),
        Link::make('Link'),
        Text::make('Text'),
        ActionComponent::make('action'),
        Table::make('users'),
        Choice::make('appearance', 'Appearance'),
    ];

    foreach ($containerComponents as $component) {
        expect(exposesSchemaApi($component))->toBeTrue();
    }

    foreach ($leafComponents as $component) {
        expect(exposesSchemaApi($component))->toBeFalse();
    }
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
        ])
        ->and(method_exists(Component::class, 'serializedChildren'))
        ->toBeFalse()
        ->and(new ReflectionClass(Component::class)->hasProperty('serialisationHooks'))
        ->toBeFalse();
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

test('components can opt out of rendering with when', function (): void {
    $page = new class extends Page
    {
        public function render(PageSchema $schema): PageSchema
        {
            return $schema->schema([
                Text::make('Visible root'),
                Text::make('Hidden root')->when(false),
                Stack::make('nested')->schema([
                    Text::make('Visible child'),
                    Text::make('Hidden child')->when(false),
                ]),
            ]);
        }
    };

    $pageData = wire($page->toArray($page->render(PageSchema::make()), new Request));

    expect($pageData['schema'])
        ->toHaveCount(2)
        ->and($pageData['schema'][0]['props']['text'])->toBe('Visible root')
        ->and($pageData['schema'][1]['schema'])->toHaveCount(1)
        ->and($pageData['schema'][1]['schema'][0]['props']['text'])->toBe('Visible child');
});

test('actions can serialize confirmation modal configuration', function (): void {
    expect(wire(ActionComponent::make('delete-account')
        ->label('Delete account')
        ->method(HttpMethod::Delete)
        ->variant(ButtonVariant::Destructive)
        ->confirm(
            title: 'Delete account?',
            description: 'This cannot be undone.',
            confirmLabel: 'Delete account',
            cancelLabel: 'Keep account',
        )))
        ->toMatchArray([
            'type' => 'action',
            'id' => 'delete-account',
            'props' => [
                'endpoint' => null,
                'label' => 'Delete account',
                'method' => 'delete',
                'icon' => null,
                'confirmation' => [
                    'title' => 'Delete account?',
                    'description' => 'This cannot be undone.',
                    'confirmLabel' => 'Delete account',
                    'cancelLabel' => 'Keep account',
                ],
                'form' => null,
                'lazyForm' => false,
                'variant' => 'destructive',
                'ref' => null,
            ],
        ]);
});

test('modals serialize composable children for action driven dialogs', function (): void {
    expect(wire(Modal::make('settings.two-factor-setup')
        ->title('Set up two-factor authentication')
        ->description('Scan the QR code with your authenticator app.')
        ->schema([
            Text::make('Recovery codes will appear here.'),
        ])))
        ->toMatchArray([
            'type' => 'modal',
            'id' => 'settings.two-factor-setup',
            'props' => [
                'title' => 'Set up two-factor authentication',
                'description' => 'Scan the QR code with your authenticator app.',
                'closeLabel' => 'Close',
                'open' => false,
                'ref' => null,
            ],
            'schema' => [
                [
                    'type' => 'text',
                    'props' => [
                        'text' => 'Recovery codes will appear here.',
                        'align' => null,
                        'size' => 'md',
                        'color' => 'muted',
                        'copyable' => false,
                    ],
                ],
            ],
        ]);
});

test('links and horizontal stacks serialize as separate composable primitives', function (): void {
    expect(wire(Stack::make('prompt')->direction('row')->gap(Gap::ExtraSmall)->schema([
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
            ],
            'schema' => [
                [
                    'type' => 'text',
                    'props' => [
                        'text' => 'Need access?',
                        'align' => null,
                        'size' => 'md',
                        'color' => 'muted',
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

test('tabs ignore hidden tab children when resolving their active value', function (): void {
    $tabs = wire(Tabs::make('settings-tabs')
        ->defaultValue('security')
        ->schema([
            Tab::make('profile', 'Profile'),
            Tab::make('security', 'Security')->when(false),
        ]));

    expect($tabs['props']['activeValue'])->toBe('profile')
        ->and($tabs['schema'])->toHaveCount(1)
        ->and($tabs['schema'][0]['props']['value'])->toBe('profile');
});
