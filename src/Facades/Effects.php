<?php
declare(strict_types=1);

namespace Lattice\Lattice\Facades;

use Illuminate\Support\Facades\Facade;
use InvalidArgumentException;
use Lattice\Lattice\Effects\Builtin\Callout;
use Lattice\Lattice\Effects\Builtin\CloseModalEffect;
use Lattice\Lattice\Effects\Builtin\DownloadEffect;
use Lattice\Lattice\Effects\Builtin\LocaleChangeEffect;
use Lattice\Lattice\Effects\Builtin\OpenModalEffect;
use Lattice\Lattice\Effects\Builtin\RedirectEffect;
use Lattice\Lattice\Effects\Builtin\ReloadComponentEffect;
use Lattice\Lattice\Effects\Builtin\ReloadPageEffect;
use Lattice\Lattice\Effects\Builtin\ResetFormEffect;
use Lattice\Lattice\Effects\Builtin\Toast;
use Lattice\Lattice\Effects\Builtin\ToggleSidebarEffect;
use Lattice\Lattice\Effects\EffectFlasher;
use Lattice\Lattice\I18n\Values\Translatable;
use Lattice\Lattice\Ui\Enums\Variant;

/**
 * @method static void flash(\Lattice\Lattice\Effects\Contracts\Effect ...$effects)
 * @method static \Lattice\Lattice\Http\LatticeResponse respond()
 *
 * @see EffectFlasher
 */
final class Effects extends Facade
{
    public static function callout(Callout $callout): Callout
    {
        return $callout;
    }

    public static function toast(string|Translatable|Toast|Variant $message, Variant|string|null $variant = null): Toast
    {
        return match (true) {
            $message instanceof Toast => $message,
            $message instanceof Variant && is_string($variant) => Toast::make($message, $variant),
            ($message instanceof Translatable || is_string($message)) && $variant instanceof Variant => Toast::make($variant, $message),
            $message instanceof Translatable || is_string($message) => Toast::make(Variant::Success, $message),
            default => throw new InvalidArgumentException('A toast message string is required.'),
        };
    }

    public static function reloadComponent(string $component): ReloadComponentEffect
    {
        return new ReloadComponentEffect($component);
    }

    public static function reloadPage(): ReloadPageEffect
    {
        return new ReloadPageEffect;
    }

    public static function redirect(string $url): RedirectEffect
    {
        return new RedirectEffect($url);
    }

    public static function download(string $url): DownloadEffect
    {
        return new DownloadEffect($url);
    }

    public static function openModal(string $modal): OpenModalEffect
    {
        return new OpenModalEffect($modal);
    }

    public static function closeModal(?string $modal = null): CloseModalEffect
    {
        return new CloseModalEffect($modal);
    }

    public static function resetForm(?string $form = null): ResetFormEffect
    {
        return new ResetFormEffect($form);
    }

    public static function localeChange(string $locale): LocaleChangeEffect
    {
        return new LocaleChangeEffect($locale);
    }

    public static function toggleSidebar(?string $target = null): ToggleSidebarEffect
    {
        return new ToggleSidebarEffect($target);
    }

    protected static function getFacadeAccessor(): string
    {
        return EffectFlasher::class;
    }
}
