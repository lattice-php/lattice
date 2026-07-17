<?php
declare(strict_types=1);

namespace Lattice\Lattice\Facades;

use Illuminate\Support\Facades\Facade;
use InvalidArgumentException;
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
use Lattice\Lattice\Effects\EffectFlasher;
use Lattice\Lattice\I18n\Values\Translatable;
use Lattice\Lattice\Ui\Enums\Variant;

/**
 * @method static void flash(\Lattice\Lattice\Effects\Effect ...$effects)
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

    public static function reloadComponent(string $component): ReloadComponent
    {
        return new ReloadComponent($component);
    }

    public static function reloadPage(): ReloadPage
    {
        return new ReloadPage;
    }

    public static function redirect(string $url): Redirect
    {
        return new Redirect($url);
    }

    public static function download(string $url): Download
    {
        return new Download($url);
    }

    public static function openModal(string $modal): OpenModal
    {
        return new OpenModal($modal);
    }

    public static function closeModal(?string $modal = null): CloseModal
    {
        return new CloseModal($modal);
    }

    public static function resetForm(?string $form = null): ResetForm
    {
        return new ResetForm($form);
    }

    public static function localeChange(string $locale): LocaleChange
    {
        return new LocaleChange($locale);
    }

    public static function toggleSidebar(?string $target = null): ToggleSidebar
    {
        return new ToggleSidebar($target);
    }

    protected static function getFacadeAccessor(): string
    {
        return EffectFlasher::class;
    }
}
