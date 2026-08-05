<?php
declare(strict_types=1);

namespace Lattice\Facades;

use Illuminate\Support\Facades\Facade;
use Lattice\Http\LatticeResponse;
use Lattice\Ui\Effects\Builtin\CloseModal;
use Lattice\Ui\Effects\Builtin\Download;
use Lattice\Ui\Effects\Builtin\LocaleChange;
use Lattice\Ui\Effects\Builtin\OpenModal;
use Lattice\Ui\Effects\Builtin\Redirect;
use Lattice\Ui\Effects\Builtin\ReloadComponent;
use Lattice\Ui\Effects\Builtin\ReloadPage;
use Lattice\Ui\Effects\Builtin\ResetForm;
use Lattice\Ui\Effects\Builtin\Toast;
use Lattice\Ui\Effects\Builtin\ToggleSidebar;
use Lattice\Ui\Effects\EffectFlasher;
use Lattice\Ui\Enums\Variant;
use Lattice\Ui\I18n\Values\Translatable;

/**
 * @method static void flash(\Lattice\Ui\Effects\Effect ...$effects)
 *
 * @see EffectFlasher
 */
final class Effects extends Facade
{
    public static function respond(): LatticeResponse
    {
        return LatticeResponse::make();
    }

    public static function toast(string|Translatable|Toast $message, Variant $variant = Variant::Success): Toast
    {
        return $message instanceof Toast ? $message : Toast::make($message, $variant);
    }

    public static function reloadComponent(string $component): ReloadComponent
    {
        return new ReloadComponent($component);
    }

    public static function reloadPage(bool $full = false): ReloadPage
    {
        return new ReloadPage($full);
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
