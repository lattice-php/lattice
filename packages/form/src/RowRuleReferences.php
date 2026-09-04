<?php
declare(strict_types=1);

namespace Lattice\Form;

/**
 * Rewrites a row field's declared validation rules so a bare sibling
 * reference (e.g. `after_or_equal:valid_from`) resolves against the
 * concrete row path (`items.1.valid_from`) instead of the top-level
 * request payload.
 */
final class RowRuleReferences
{
    /**
     * @var array<int, string>
     */
    private const array SINGLE_FIELD_RULES = [
        'after', 'after_or_equal', 'before', 'before_or_equal',
        'same', 'different', 'gt', 'gte', 'lt', 'lte', 'date_equals',
    ];

    /**
     * @var array<int, string>
     */
    private const array ALL_PARAMS_FIELD_RULES = [
        'required_with', 'required_with_all', 'required_without', 'required_without_all',
    ];

    /**
     * @var array<int, string>
     */
    private const array FIRST_PARAM_FIELD_RULES = [
        'required_if', 'required_unless', 'prohibited_if', 'prohibited_unless',
        'exclude_if', 'exclude_unless', 'accepted_if', 'declined_if',
    ];

    /**
     * @param  array<int, mixed>  $rules
     * @param  array<int, string>  $siblingNames
     * @return array<int, mixed>
     */
    public static function rewrite(array $rules, string $rowPath, array $siblingNames): array
    {
        return array_map(
            static fn (mixed $rule): mixed => is_string($rule)
                ? self::rewriteRule($rule, $rowPath, $siblingNames)
                : $rule,
            $rules,
        );
    }

    /**
     * @param  array<int, string>  $siblingNames
     */
    private static function rewriteRule(string $rule, string $rowPath, array $siblingNames): string
    {
        if (! str_contains($rule, ':')) {
            return $rule;
        }

        [$name, $paramString] = explode(':', $rule, 2);
        $params = explode(',', $paramString);

        if ($name === 'in_array') {
            return "{$name}:".self::rewriteInArrayParam($params[0], $rowPath, $siblingNames);
        }

        if (in_array($name, self::FIRST_PARAM_FIELD_RULES, true)) {
            $params[0] = self::rewriteParam($params[0], $rowPath, $siblingNames);

            return "{$name}:".implode(',', $params);
        }

        if (in_array($name, self::SINGLE_FIELD_RULES, true) || in_array($name, self::ALL_PARAMS_FIELD_RULES, true)) {
            $params = array_map(
                static fn (string $param): string => self::rewriteParam($param, $rowPath, $siblingNames),
                $params,
            );

            return "{$name}:".implode(',', $params);
        }

        return $rule;
    }

    /**
     * @param  array<int, string>  $siblingNames
     */
    private static function rewriteParam(string $param, string $rowPath, array $siblingNames): string
    {
        return in_array($param, $siblingNames, true) ? "{$rowPath}.{$param}" : $param;
    }

    /**
     * @param  array<int, string>  $siblingNames
     */
    private static function rewriteInArrayParam(string $param, string $rowPath, array $siblingNames): string
    {
        if (! str_ends_with($param, '.*')) {
            return $param;
        }

        $field = substr($param, 0, -2);

        return self::rewriteParam($field, $rowPath, $siblingNames).'.*';
    }
}
