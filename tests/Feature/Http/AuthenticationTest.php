<?php
declare(strict_types=1);

use Workbench\App\Models\User;

use function Pest\Laravel\get;
use function Pest\Laravel\post;
use function Pest\Laravel\withoutVite;

test('login page renders a simple seeded credential form', function (): void {
    withoutVite();

    $response = get('/login')->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('lattice/page')
        ->where('lattice.title', 'Sign in')
        ->where('lattice.layout', null));

    $this->assertLatticePage($response)
        ->assertRendered('stack:login-page')
        ->component('form', 'login-form', fn ($form) => $form->assertProps([
            'action' => '/login',
            'submitLabel' => 'Sign in',
            'state.email' => 'workbench@example.com',
            'state.password' => 'password',
        ]));
});

test('workbench user can log in', function (): void {
    workbenchTestUser(['email' => 'workbench@example.com']);

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
    $this->actingAs(workbenchTestUser());

    post('/logout')->assertRedirect('/login');

    $this->assertGuest();
});
