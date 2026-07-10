<?php
declare(strict_types=1);

use Lattice\Lattice\Chat\ChatMessage;
use Lattice\Lattice\Chat\ChatPart;
use Lattice\Lattice\Chat\Enums\ChatRole;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Core\Values\Translatable;
use Lattice\Lattice\Effects\Effect;
use Lattice\Lattice\Support\Wire;
use Lattice\Lattice\Tables\Filters\TernaryFilter;

enum PureWireEnum
{
    case Loose;
}

dataset('wire values', [
    'node with schema and props' => [fn (): mixed => TernaryFilter::make('verified')],
    'plain value object with nested components' => [fn (): mixed => new ChatMessage('m-1', ChatRole::User, [ChatPart::text('hi')])],
    'wire-mapped empty payload' => [fn (): mixed => Translatable::make('common.action.save')],
    'effect with nested value object' => [fn (): mixed => Effect::toast('Saved')],
    'mixed array with map and list' => [fn (): mixed => ['empty' => Wire::map([]), 'options' => [new Option('Active', 'active')]]],
]);

it('materializes toWire exactly as a JSON round-trip would', function (Closure $value): void {
    $value = $value();

    expect(json_encode(Wire::toWire($value), JSON_THROW_ON_ERROR))
        ->toBe(json_encode($value, JSON_THROW_ON_ERROR))
        ->and(Wire::toWire($value))
        ->toEqual(json_decode(json_encode($value, JSON_THROW_ON_ERROR)));
})->with('wire values');

it('materializes toArray exactly as an assoc JSON round-trip would', function (Closure $value): void {
    $value = $value();

    expect(Wire::toArray($value))
        ->toBe(json_decode(json_encode($value, JSON_THROW_ON_ERROR), true));
})->with('wire values');

it('rejects a non-backed enum the way json_encode does', function (): void {
    expect(fn (): mixed => Wire::toWire(PureWireEnum::Loose))->toThrow(JsonException::class);
});
