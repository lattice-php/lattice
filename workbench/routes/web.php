<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

Route::get('/dashboard', fn (): string => 'Dashboard')->name('dashboard');
Route::get('/login', fn (): string => 'Login')->name('login');
Route::post('/login', fn () => redirect()->route('home'))->name('login.store');
Route::get('/register', fn (): string => 'Register')->name('register');
Route::get('/forgot-password', fn (): string => 'Forgot password')->name('password.request');
Route::post('/forgot-password', fn () => redirect()->route('login'))->name('password.email');
Route::post('/reset-password', fn () => redirect()->route('login'))->name('password.update');
