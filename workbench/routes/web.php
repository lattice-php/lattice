<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Workbench\App\Pages\DependentDemoPage;
use Workbench\App\Pages\HomePage;
use Workbench\App\Pages\ProductCreatePage;
use Workbench\App\Pages\ProductEditPage;
use Workbench\App\Pages\ProductsPage;
use Workbench\App\Pages\ShowcasePage;
use Workbench\App\Pages\TablesPage;

Route::latticePage('/', HomePage::class)
    ->name('home');

Route::latticePage('/tables', TablesPage::class)
    ->name('tables');

Route::latticePage('/products', ProductsPage::class)
    ->name('products.index');

Route::latticePage('/products/create', ProductCreatePage::class)
    ->name('products.create');

Route::latticePage('/products/{product}/edit', ProductEditPage::class)
    ->name('products.edit');

Route::latticePage('/dependent-demo', DependentDemoPage::class)
    ->name('dependent.demo');

Route::latticePage('/showcase', ShowcasePage::class)
    ->name('showcase');

Route::get('/dashboard', fn (): string => 'Dashboard')->name('dashboard');
Route::get('/login', fn (): string => 'Login')->name('login');
Route::post('/login', fn () => redirect()->route('home'))->name('login.store');
Route::get('/register', fn (): string => 'Register')->name('register');
Route::get('/forgot-password', fn (): string => 'Forgot password')->name('password.request');
Route::post('/forgot-password', fn () => redirect()->route('login'))->name('password.email');
Route::post('/reset-password', fn () => redirect()->route('login'))->name('password.update');
