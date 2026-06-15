<?php
declare(strict_types=1);

use Illuminate\Contracts\Translation\HasLocalePreference;
use Orchestra\Testbench\Factories\UserFactory;
use Workbench\App\Models\User;

use function Pest\Laravel\get;
use function Pest\Laravel\post;
use function Pest\Laravel\withoutVite;

test('workbench auth uses the locale aware workbench user model', function (): void {
    $model = config('auth.providers.users.model');

    expect($model)->toBe(User::class)
        ->and(is_a($model, HasLocalePreference::class, true))->toBeTrue();

    $user = new User(['locale' => 'de']);

    expect($user->preferredLocale())->toBe('de');
});

test('login page renders a simple seeded credential form', function (): void {
    withoutVite();

    get('/login')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('lattice/page')
            ->where('lattice.title', 'Sign in')
            ->where('lattice.layout', null)
            ->where('lattice.schema.0.key', 'login-page')
            ->where('lattice.schema.0.schema.2.type', 'form')
            ->where('lattice.schema.0.schema.2.props.action', '/login')
            ->where('lattice.schema.0.schema.2.props.submitLabel', 'Sign in')
            ->where('lattice.schema.0.schema.2.props.state.email', 'workbench@example.com')
            ->where('lattice.schema.0.schema.2.props.state.password', 'password'));
});

test('workbench user can log in', function (): void {
    User::query()->create([
        'name' => 'Workbench User',
        'email' => 'workbench@example.com',
        'password' => 'password',
        'locale' => 'en',
    ]);

    post('/login', [
        'email' => 'workbench@example.com',
        'password' => 'password',
    ])->assertRedirect('/');

    $this->assertAuthenticated();
    expect(auth()->user())->toBeInstanceOf(User::class);
});

test('invalid login keeps the user unauthenticated', function (): void {
    post('/login', [
        'email' => 'workbench@example.com',
        'password' => 'wrong-password',
    ])->assertSessionHasErrors('email');

    $this->assertGuest();
});

test('authenticated workbench users can log out', function (): void {
    $user = UserFactory::new()->create();

    $this->actingAs($user);

    post('/logout')->assertRedirect('/login');

    $this->assertGuest();
});
