<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects;

use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Effects\Builtin\Callout;
use Lattice\Lattice\Effects\Builtin\CloseModal;
use Lattice\Lattice\Effects\Builtin\Download;
use Lattice\Lattice\Effects\Builtin\LocaleChange;
use Lattice\Lattice\Effects\Builtin\OpenModal;
use Lattice\Lattice\Effects\Builtin\Redirect;
use Lattice\Lattice\Effects\Builtin\ReloadComponent;
use Lattice\Lattice\Effects\Builtin\ReloadPage;
use Lattice\Lattice\Effects\Builtin\ResetForm;
use Lattice\Lattice\Effects\Builtin\Toast;
use Lattice\Lattice\Effects\Builtin\ToggleSidebar;
use Lattice\Lattice\Support\WireTypeRegistry;

/**
 * The single source of truth for effect value objects: wire type → class-string.
 * Drives TypeScript generation and guards wire-type uniqueness. It is NOT a
 * gate for emitting — ActionResult::effect() and Effects::flash() accept any
 * Effect regardless of registration.
 *
 * @extends WireTypeRegistry<Effect>
 */
final class EffectRegistry extends WireTypeRegistry
{
    private const array BUILTINS = [
        Callout::class,
        CloseModal::class,
        Download::class,
        LocaleChange::class,
        OpenModal::class,
        Redirect::class,
        ReloadComponent::class,
        ReloadPage::class,
        ResetForm::class,
        Toast::class,
        ToggleSidebar::class,
    ];

    /**
     * A fresh registry holding only the package's built-in effects. Used by the
     * container binding and by TypeScript generation, both of which need the
     * built-in set independent of an application's runtime registrations.
     */
    public static function withBuiltins(): self
    {
        $registry = new self;

        foreach (self::BUILTINS as $effect) {
            $registry->register($effect);
        }

        return $registry;
    }

    #[\Override]
    public static function attribute(): string
    {
        return AsEffect::class;
    }

    #[\Override]
    public static function baseClass(): string
    {
        return Effect::class;
    }
}
