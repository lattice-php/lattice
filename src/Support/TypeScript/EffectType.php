<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use Lattice\Lattice\Core\Enums\ToastVariant;
use Spatie\TypeScriptTransformer\References\ClassStringReference;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptLiteral;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptNode;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptObject;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptProperty;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptReference;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptString;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptUnion;

/**
 * Builds the `Effect` discriminated union by hand.
 *
 * This is the one intentionally hand-maintained type. Unlike every other
 * generated type it cannot be reflected from PHP: Lattice's Effect class is a
 * single class whose per-effect payload shapes live inside static factory bodies
 * as untyped arrays, not as typed properties. Until those become per-effect
 * value objects, the union is mirrored here. The `EffectType` enum it
 * discriminates on is still generated from the matching PHP enum.
 */
final class EffectType
{
    public static function build(): TypeScriptNode
    {
        $optional = fn (string $name): TypeScriptProperty => new TypeScriptProperty($name, new TypeScriptString, isOptional: true);

        $effect = fn (string $type, array $payload = []): TypeScriptObject => new TypeScriptObject([
            new TypeScriptProperty('type', new TypeScriptLiteral($type)),
            ...$payload,
        ]);

        return new TypeScriptUnion([
            $effect('toast', [
                $optional('message'),
                new TypeScriptProperty('variant', new TypeScriptReference(new ClassStringReference(ToastVariant::class)), isOptional: true),
            ]),
            $effect('reloadComponent', [$optional('component')]),
            $effect('reloadPage'),
            $effect('redirect', [$optional('url')]),
            $effect('download', [$optional('url')]),
            $effect('openModal', [$optional('modal')]),
            $effect('closeModal', [$optional('modal')]),
            $effect('resetForm', [$optional('form')]),
        ]);
    }
}
