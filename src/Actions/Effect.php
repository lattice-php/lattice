<?php
declare(strict_types=1);

namespace Lattice\Lattice\Actions;

use Lattice\Lattice\Actions\Effects\CalloutEffect;
use Lattice\Lattice\Actions\Effects\CloseModalEffect;
use Lattice\Lattice\Actions\Effects\DownloadEffect;
use Lattice\Lattice\Actions\Effects\LocaleChangeEffect;
use Lattice\Lattice\Actions\Effects\OpenModalEffect;
use Lattice\Lattice\Actions\Effects\RedirectEffect;
use Lattice\Lattice\Actions\Effects\ReloadComponentEffect;
use Lattice\Lattice\Actions\Effects\ReloadPageEffect;
use Lattice\Lattice\Actions\Effects\ResetFormEffect;
use Lattice\Lattice\Actions\Effects\ToastEffect;
use Lattice\Lattice\Core\Enums\Variant;
use Lattice\Lattice\Core\Values\Callout;
use Lattice\Lattice\Core\Values\ToastMessage;

final class Effect
{
    public static function callout(Callout $callout): CalloutEffect
    {
        return new CalloutEffect($callout);
    }

    public static function toast(string|ToastMessage|Variant $message, Variant|string|null $variant = null): ToastEffect
    {
        $toast = match (true) {
            $message instanceof ToastMessage => $message,
            $message instanceof Variant && is_string($variant) => ToastMessage::make($message, $variant),
            is_string($message) && $variant instanceof Variant => ToastMessage::make($variant, $message),
            is_string($message) => ToastMessage::make(Variant::Success, $message),
            default => throw new \InvalidArgumentException('A toast message string is required.'),
        };

        return new ToastEffect($toast);
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
}
