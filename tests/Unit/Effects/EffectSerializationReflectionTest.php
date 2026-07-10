<?php

declare(strict_types=1);

use Lattice\Lattice\Attributes\WireMap;
use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Effects\Effect;
use Lattice\Lattice\Facades\Effects;
use Lattice\Lattice\Ui\Enums\Variant;

#[AsEffect('test.enum-effect')]
final readonly class EnumPayloadEffect extends Effect
{
    /**
     * @param  array<string, string>  $meta
     */
    public function __construct(
        public Variant $variant,
        #[WireMap]
        public array $meta = [],
    ) {}
}

#[AsEffect('test.internal-state')]
final readonly class InternalStateEffect extends Effect
{
    public function __construct(
        public string $url,
        protected string $internal = 'secret',
    ) {}
}

it('coerces enum props and wire-maps arrays', function (): void {
    expect(wire(new EnumPayloadEffect(Variant::Success)))->toEqual([
        'type' => 'test.enum-effect',
        'variant' => 'success',
        'meta' => [],
    ]);
});

it('wire-maps an empty array prop to a JSON object, not an array', function (): void {
    expect(wireJson(new EnumPayloadEffect(Variant::Success)))->toContain('"meta":{}');
});

it('keeps the builtin close-modal shape', function (): void {
    expect(wire(Effects::closeModal()))->toEqual(['type' => 'close-modal', 'modal' => null]);
});

it('never serializes non-public props', function (): void {
    expect(wire(new InternalStateEffect('/x')))->toEqual(['type' => 'test.internal-state', 'url' => '/x']);
});
