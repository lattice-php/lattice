<?php
declare(strict_types=1);

namespace Lattice\Effects;

use Lattice\Core\Support\WireTypeRegistry;
use Lattice\Effects\Builtin\Callout;
use Lattice\Effects\Builtin\CloseModal;
use Lattice\Effects\Builtin\Download;
use Lattice\Effects\Builtin\LocaleChange;
use Lattice\Effects\Builtin\OpenModal;
use Lattice\Effects\Builtin\Redirect;
use Lattice\Effects\Builtin\ReloadComponent;
use Lattice\Effects\Builtin\ReloadPage;
use Lattice\Effects\Builtin\ResetForm;
use Lattice\Effects\Builtin\RetractCallout;
use Lattice\Effects\Builtin\Toast;
use Lattice\Effects\Builtin\ToggleSidebar;
use Lattice\Ui\Effects\Attributes\AsEffect;
use Lattice\Ui\Effects\Effect;

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
        RetractCallout::class,
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
