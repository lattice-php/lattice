---
title: Validation
description: Server-side validation with Laravel rules, custom messages, and live feedback through Precognition.
---

Validation always runs on the server using Laravel's validator, so the rules you write are the rules
that protect your data. With Precognition enabled, the same rules also run live as the user fills the
form, without you writing any client-side validation.

## Adding rules

`->rules()` accepts an array of Laravel validation rules. Calls accumulate, so you can add rules
across several calls or alongside the helpers below.

```php
TextInput::make('name', 'Team name')
    ->rules(['min:2', 'max:50']);
```

Rules may be rule objects, not just strings:

```php
use Illuminate\Validation\Rules\Password;

PasswordInput::make('password', 'Password')
    ->rules([Password::min(8)->mixedCase()->numbers()]);
```

## Rule helpers

Some rules have dedicated methods that read better and may adjust the field at the same time.
`->required()` adds the `required` rule and the required indicator; `->email()` sets the input type
to `email` and adds email validation.

```php
TextInput::make('email', 'Email address')
    ->required()
    ->email();
```

## Custom messages

`->message()` overrides the message for a single rule on this field. The first argument is the rule
name, the second is the message.

```php
TextInput::make('name', 'Team name')
    ->rules(['min:2'])
    ->message('min', 'Your team name needs at least two characters.');
```

## Dynamic rules

Pass a closure to `->rules()` to build rules from the current form data. The closure receives the
`FormData` and the `Request`, and returns additional rules. It runs at validation time, so it always
sees the latest input. See [Closure evaluation](/core/closure-evaluation/) for the full utility list.

```php
TextInput::make('discount_code', 'Discount code')
    ->rules(fn (FormData $data, Request $request) => $data->boolean('has_discount')
        ? ['required', 'exists:discounts,code']
        : []);
```

## Live validation

Validation runs live through [Laravel Precognition](https://laravel.com/docs/precognition): as the
user edits a field, the form sends a precognitive request to its [endpoint](/advanced/security/) that runs your rules and returns messages
without executing the submission. Because it is the exact same server-side ruleset, there is nothing
to keep in sync — what passes live is what passes on submit.
