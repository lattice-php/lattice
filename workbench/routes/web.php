<?php

declare(strict_types=1);

use Bambamboole\Lattice\Enums\LucideIcon;
use Illuminate\Support\Facades\Route;
use Workbench\App\Pages\WorkbenchDependentDemoPage;
use Workbench\App\Pages\WorkbenchHomePage;
use Workbench\App\Pages\WorkbenchProductCreatePage;
use Workbench\App\Pages\WorkbenchProductEditPage;
use Workbench\App\Pages\WorkbenchProductsPage;
use Workbench\App\Pages\WorkbenchTablesPage;

Route::latticePage('/', WorkbenchHomePage::class)
    ->name('home')
    ->sidebar('Home', LucideIcon::House);

Route::latticePage('/tables', WorkbenchTablesPage::class)
    ->name('tables')
    ->sidebar('Tables', LucideIcon::Table);

Route::latticePage('/products', WorkbenchProductsPage::class)
    ->name('products.index')
    ->sidebar('Products', LucideIcon::Package);

Route::latticePage('/products/create', WorkbenchProductCreatePage::class)
    ->name('products.create');

Route::latticePage('/products/{product}/edit', WorkbenchProductEditPage::class)
    ->name('products.edit');

Route::latticePage('/dependent-demo', WorkbenchDependentDemoPage::class)
    ->name('dependent.demo');

Route::get('/dashboard', fn (): string => 'Dashboard')->name('dashboard');
Route::get('/login', fn (): string => 'Login')->name('login');
Route::post('/login', fn () => redirect()->route('home'))->name('login.store');
Route::get('/register', fn (): string => 'Register')->name('register');
Route::get('/forgot-password', fn (): string => 'Forgot password')->name('password.request');
Route::post('/forgot-password', fn () => redirect()->route('login'))->name('password.email');
Route::post('/reset-password', fn () => redirect()->route('login'))->name('password.update');
