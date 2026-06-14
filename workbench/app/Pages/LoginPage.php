<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\Page;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\RawBlock;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\Align;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\Enums\PageContainer;
use Lattice\Lattice\Core\Enums\PageLayout;
use Lattice\Lattice\Core\Enums\Width;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\Components\PasswordInput;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Http\Page as BasePage;
use Workbench\App\Support\Logo;

#[Page(route: '/login', name: 'login', layout: PageLayout::None, container: PageContainer::Centered, middleware: ['web'])]
final class LoginPage extends BasePage
{
    public function title(): string
    {
        return __('workbench.auth.login.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('login-page')
                ->align(Align::Center)
                ->gap(Gap::Small)
                ->width(Width::Fill)
                ->schema([
                    RawBlock::make('login-logo')->html(Logo::mark('size-12')),
                    Stack::make('login-heading')
                        ->align(Align::Center)
                        ->gap(Gap::None)
                        ->schema([
                            Heading::make(__('workbench.auth.login.heading')),
                            Text::make(__('workbench.auth.login.description')),
                            Text::make(__('workbench.auth.login.seeded-account')),
                        ]),
                    FormComponent::make('login-form')
                        ->action(route('login.store', absolute: false))
                        ->submitLabel(__('workbench.auth.login.submit'))
                        ->fill([
                            'email' => 'workbench@example.com',
                            'password' => 'password',
                        ])
                        ->schema([
                            TextInput::make('email', __('workbench.auth.login.email'))
                                ->email()
                                ->autoComplete('email')
                                ->autoFocus()
                                ->required(),
                            PasswordInput::make('password', __('workbench.auth.login.password'))
                                ->autoComplete('current-password')
                                ->required(),
                        ]),
                ]),
        ]);
    }
}
