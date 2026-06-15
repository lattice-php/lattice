<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects;

use InvalidArgumentException;
use Lattice\Lattice\Core\Enums\Variant;
use Lattice\Lattice\Core\Values\Callout;
use Lattice\Lattice\Core\Values\ToastMessage;
use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Effects\Builtin\CalloutEffect;
use Lattice\Lattice\Effects\Builtin\CloseModalEffect;
use Lattice\Lattice\Effects\Builtin\DownloadEffect;
use Lattice\Lattice\Effects\Builtin\LocaleChangeEffect;
use Lattice\Lattice\Effects\Builtin\OpenModalEffect;
use Lattice\Lattice\Effects\Builtin\RedirectEffect;
use Lattice\Lattice\Effects\Builtin\ReloadComponentEffect;
use Lattice\Lattice\Effects\Builtin\ReloadPageEffect;
use Lattice\Lattice\Effects\Builtin\ResetFormEffect;
use Lattice\Lattice\Effects\Builtin\ToastEffect;
use Lattice\Lattice\Effects\Contracts\Effect as EffectContract;

abstract readonly class Effect implements EffectContract
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
            default => throw new InvalidArgumentException('A toast message string is required.'),
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

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return ['type' => $this->wireType(), ...get_object_vars($this)];
    }

    public function wireType(): string
    {
        /** @var array<class-string, string> $cache */
        static $cache = [];

        return $cache[static::class] ??= AsEffect::wireTypeForClass(static::class);
    }
}
