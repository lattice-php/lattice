<?php
declare(strict_types=1);

use Lattice\Table\Columns\BadgeColumn;
use Lattice\Table\Columns\BooleanColumn;
use Lattice\Table\Columns\Column;
use Lattice\Table\Columns\IconColumn;
use Lattice\Table\Columns\ImageColumn;
use Lattice\Table\Columns\MoneyColumn;
use Lattice\Table\Columns\NumberColumn;
use Lattice\Table\Columns\StackColumn;
use Lattice\Table\Columns\TextColumn;

/**
 * Columns reflect their public properties into the wire props, so any public
 * property is a contract. These guards catch an internal field accidentally made
 * public (which would silently leak into `props`) — the safety net the explicit
 * props value objects used to provide.
 *
 * @param  class-string  $class
 * @return list<string>
 */
function publicColumnProps(string $class): array
{
    return array_map(
        fn (ReflectionProperty $property): string => $property->getName(),
        new ReflectionClass($class)->getProperties(ReflectionProperty::IS_PUBLIC),
    );
}

const COMMON_COLUMN_PROPS = ['label', 'width', 'align', 'sortable', 'toggleable', 'hiddenByDefault', 'filter', 'options'];

it('exposes exactly the common wire props on the base Column', function (): void {
    expect(publicColumnProps(Column::class))->toEqualCanonicalizing(COMMON_COLUMN_PROPS);
});

it('exposes only the intended wire props on each built-in column', function (string $class, array $expected): void {
    if (! class_exists($class)) {
        throw new InvalidArgumentException("Not a class: {$class}");
    }

    expect(publicColumnProps($class))->toEqualCanonicalizing([...COMMON_COLUMN_PROPS, ...$expected]);
})->with([
    'text' => [TextColumn::class, ['date', 'copyable', 'link', 'badge', 'multiple']],
    'boolean' => [BooleanColumn::class, []],
    'number' => [NumberColumn::class, ['minimumFractionDigits', 'maximumFractionDigits', 'unit', 'compact', 'copyable']],
    'money' => [MoneyColumn::class, ['minimumFractionDigits', 'maximumFractionDigits', 'currency', 'currencyField', 'copyable']],
    'badge' => [BadgeColumn::class, ['colors']],
    'icon' => [IconColumn::class, ['icon', 'icons', 'colors']],
    'image' => [ImageColumn::class, ['circular', 'size', 'previewable']],
    'stack' => [StackColumn::class, []],
]);
