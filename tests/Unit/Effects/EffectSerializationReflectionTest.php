<?php

declare(strict_types=1);

use Lattice\Core\Attributes\WireMap;
use Lattice\Facades\Effects;
use Lattice\Ui\Effects\Attributes\AsEffect;
use Lattice\Ui\Effects\Effect;
use Lattice\Ui\Enums\Variant;

#[AsEffect('test.enum-effect')]
final class EnumPayloadEffect extends Effect
{
    /**
     * @param  array<string, string>  $meta
     */
    public function __construct(
        public readonly Variant $variant,
        #[WireMap]
        public readonly array $meta = [],
    ) {}
}

#[AsEffect('test.internal-state')]
final class InternalStateEffect extends Effect
{
    public function __construct(
        public readonly string $url,
        protected string $internal = 'secret',
    ) {}
}

it('coerces enum props and wire-maps arrays', function (): void {
    expect(wire(new EnumPayloadEffect(Variant::Success)))->toEqual([
        'type' => 'test.enum-effect',
        'props' => ['variant' => 'success', 'meta' => []],
    ]);
});

it('wire-maps an empty array prop to a JSON object, not an array', function (): void {
    expect(wireJson(new EnumPayloadEffect(Variant::Success)))->toContain('"meta":{}');
});

it('keeps the builtin close-modal shape', function (): void {
    expect(wire(Effects::closeModal()))->toEqual(['type' => 'close-modal', 'props' => ['modal' => null]]);
});

it('never serializes non-public props', function (): void {
    expect(wire(new InternalStateEffect('/x')))->toEqual(['type' => 'test.internal-state', 'props' => ['url' => '/x']]);
});
