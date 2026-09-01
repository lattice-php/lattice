<?php

declare(strict_types=1);

namespace Lattice\Form\Components;

use Illuminate\Http\Request;
use Lattice\Core\Attributes\SerializationHook;
use Lattice\Form\Attributes\AsField;
use Lattice\Form\Enums\FieldType;
use Lattice\Form\FormData;
use Lattice\Form\PatternInput\PatternSegments;
use Lattice\Form\PatternInput\PatternToken;
use Lattice\Form\PatternInput\PatternTokenData;

/**
 * A pattern of free text and typed token chips (e.g. a document-numbering
 * template). The value is an ordered list of `{type: "text", value}` /
 * `{type: "token", token, config}` segments — never a Tiptap document, the
 * client owns the doc<->segments conversion.
 */
#[AsField(FieldType::PatternInput)]
class PatternInput extends Field
{
    /**
     * @var list<PatternToken>
     */
    protected array $patternTokens = [];

    /**
     * @var list<string>
     */
    protected array $requiredTokenNames = [];

    /** @var list<PatternTokenData> */
    public array $tokens = [];

    public string $separator = '';

    public bool $multiline = false;

    public ?int $rows = null;

    /**
     * @param  array<int, PatternToken>  $tokens
     */
    public function tokens(array $tokens): static
    {
        $this->patternTokens = array_values($tokens);

        return $this;
    }

    /**
     * Token names that must appear somewhere in the pattern.
     *
     * @param  array<int, string>  $names
     */
    public function requiredTokens(array $names): static
    {
        $this->requiredTokenNames = array_values($names);

        return $this;
    }

    /**
     * Text inserted between a newly-inserted token chip and adjacent
     * content — an insert-time convenience for the editor, not a validated
     * constraint.
     */
    public function separator(string $separator): static
    {
        $this->separator = $separator;

        return $this;
    }

    /**
     * Allows line breaks: Enter splits the pattern into a new line, stored as
     * `\n` inside text segments. Single-line fields reject `\n` instead.
     */
    public function multiline(bool $multiline = true): static
    {
        $this->multiline = $multiline;

        return $this;
    }

    /**
     * Minimum visible height of a multiline editor, in text rows.
     */
    public function rows(int $rows): static
    {
        $this->rows = $rows;

        return $this;
    }

    /**
     * @return array<int, mixed>
     */
    #[\Override]
    protected function defaultRules(): array
    {
        return [
            ...parent::defaultRules(),
            new PatternSegments($this->patternTokens, $this->requiredTokenNames, $this->multiline),
        ];
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    #[\Override]
    public function nestedRules(FormData $data, Request $request): array
    {
        $segments = PatternSegments::decode($data->get($this->name));
        $rules = [];

        if ($segments === null) {
            return $rules;
        }

        foreach ($segments as $index => $segment) {
            // Every leaf key needs its own passthrough rule, or Laravel's
            // excludeUnvalidatedArrayKeys silently drops it from $validated —
            // the same reason RowsField gives every child field a passthrough.
            $rules["{$this->name}.{$index}.type"] = ['sometimes', 'nullable', 'string'];
            $rules["{$this->name}.{$index}.value"] = ['sometimes', 'nullable', 'string'];
            $rules["{$this->name}.{$index}.token"] = ['sometimes', 'nullable', 'string'];

            if (! is_array($segment) || ($segment['type'] ?? null) !== 'token') {
                continue;
            }

            $token = $this->tokenNamed($segment['token'] ?? null);

            if (! $token instanceof PatternToken) {
                continue;
            }

            $scope = FormData::make(is_array($segment['config'] ?? null) ? $segment['config'] : []);

            foreach ($token->fields() as $child) {
                $rules["{$this->name}.{$index}.config.{$child->name()}"] = $child->resolvedRulesWithRequired($scope, $request);
            }
        }

        return $rules;
    }

    /**
     * Decodes the wire value before validation so {@see nestedRules()}'s
     * dot-path keys can traverse it. Passes an undecodable value through
     * unchanged, so {@see PatternSegments} still reports its own failure.
     */
    #[\Override]
    public function normalizeInput(mixed $value): mixed
    {
        return PatternSegments::decode($value) ?? $value;
    }

    #[\Override]
    public function castValue(mixed $value): mixed
    {
        $segments = PatternSegments::decode($value);

        if ($segments === null) {
            return [];
        }

        return array_values(array_filter(
            array_map($this->castSegment(...), $segments),
            static fn (?array $segment): bool => $segment !== null,
        ));
    }

    /**
     * @return array<string, mixed>|null
     */
    private function castSegment(mixed $segment): ?array
    {
        if (! is_array($segment)) {
            return null;
        }

        if (($segment['type'] ?? null) === 'text') {
            return ['type' => 'text', 'value' => (string) ($segment['value'] ?? '')];
        }

        $token = $this->tokenNamed($segment['token'] ?? null);

        if (! $token instanceof PatternToken) {
            return null;
        }

        $config = is_array($segment['config'] ?? null) ? $segment['config'] : [];
        $cast = [];

        foreach ($token->fields() as $child) {
            $cast[$child->name()] = $child->castValue($config[$child->name()] ?? null);
        }

        return ['type' => 'token', 'token' => $token->name, 'config' => $cast];
    }

    private function tokenNamed(mixed $name): ?PatternToken
    {
        if (! is_string($name)) {
            return null;
        }

        foreach ($this->patternTokens as $token) {
            if ($token->name === $name) {
                return $token;
            }
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 190)]
    protected function prepareTokens(array $data): array
    {
        $this->tokens = array_map(
            static fn (PatternToken $token): PatternTokenData => $token->data(),
            $this->patternTokens,
        );

        return $data;
    }
}
