<?php
declare(strict_types=1);

use Lattice\Form\RowRuleReferences;

it('rewrites a single-field-reference rule to the concrete row path', function (): void {
    $rewritten = RowRuleReferences::rewrite(['after_or_equal:valid_from'], 'items.1', ['valid_from', 'valid_to']);

    expect($rewritten)->toBe(['after_or_equal:items.1.valid_from']);
});

it('leaves a single-field-reference rule alone when the parameter is not a sibling', function (): void {
    $rewritten = RowRuleReferences::rewrite(['after:2024-01-01'], 'items.1', ['valid_from', 'valid_to']);

    expect($rewritten)->toBe(['after:2024-01-01']);
});

it('rewrites every parameter of an all-fields rule', function (): void {
    $rewritten = RowRuleReferences::rewrite(['required_with:qty,price'], 'items.0', ['qty', 'price', 'note']);

    expect($rewritten)->toBe(['required_with:items.0.qty,items.0.price']);
});

it('rewrites only the leading field parameter of a field-then-value rule', function (): void {
    $rewritten = RowRuleReferences::rewrite(['required_if:kind,paid'], 'items.0', ['kind', 'note']);

    expect($rewritten)->toBe(['required_if:items.0.kind,paid']);
});

it('rewrites only the field portion of an in_array wildcard parameter', function (): void {
    $rewritten = RowRuleReferences::rewrite(['in_array:sibling.*'], 'items.0', ['sibling', 'note']);

    expect($rewritten)->toBe(['in_array:items.0.sibling.*']);
});

it('passes through rules with no colon and non-string rule objects unchanged', function (): void {
    $rule = new stdClass;
    $rewritten = RowRuleReferences::rewrite(['required', $rule], 'items.0', ['note']);

    expect($rewritten)->toBe(['required', $rule]);
});

it('leaves an unrelated rule name untouched even when its parameter matches a sibling name', function (): void {
    $rewritten = RowRuleReferences::rewrite(['max:note'], 'items.0', ['note']);

    expect($rewritten)->toBe(['max:note']);
});
