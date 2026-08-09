<?php

declare(strict_types=1);

namespace Lattice\Form\PatternInput;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Validates a PatternInput's submitted segment array: every segment is a
 * well-shaped text or token entry, every token name is declared and appears
 * at most once, and every required token is present.
 */
final readonly class PatternSegments implements ValidationRule
{
    /**
     * @param  list<PatternToken>  $tokens
     * @param  list<string>  $requiredTokens
     */
    public function __construct(
        private array $tokens,
        private array $requiredTokens,
    ) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_array($value)) {
            return;
        }

        $names = array_map(static fn (PatternToken $token): string => $token->name, $this->tokens);
        $seen = [];

        foreach ($value as $index => $segment) {
            if (! is_array($segment) || ! in_array($segment['type'] ?? null, ['text', 'token'], true)) {
                $fail("The {$attribute}.{$index} segment is invalid.");

                continue;
            }

            if ($segment['type'] === 'text') {
                if (! is_string($segment['value'] ?? null)) {
                    $fail("The {$attribute}.{$index}.value field must be a string.");
                }

                continue;
            }

            $token = $segment['token'] ?? null;

            if (! is_string($token) || ! in_array($token, $names, true)) {
                $fail("The {$attribute}.{$index}.token field must be a declared token.");

                continue;
            }

            if (isset($seen[$token])) {
                $fail("The {$token} token may only be used once.");

                continue;
            }

            $seen[$token] = true;
        }

        foreach ($this->requiredTokens as $required) {
            if (! isset($seen[$required])) {
                $fail("The {$attribute} must include the {$required} token.");
            }
        }
    }
}
