<?php
declare(strict_types=1);

namespace Lattice\Notifications;

use Illuminate\Contracts\Translation\Translator;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Lattice\Notifications\Support\ActionDescriptor;
use Lattice\Ui\Enums\Variant;
use Lattice\Ui\I18n\Values\Translatable;

final readonly class NotificationPresenter
{
    public function __construct(private Translator $translator) {}

    public function present(
        DatabaseNotification $notification,
        NotificationTranslationMode $translationMode,
        ?string $locale = null,
    ): NotificationItem {
        $data = $notification->getAttribute('data');
        $data = is_array($data) ? $data : [];
        $variant = $data['variant'] ?? null;

        return new NotificationItem(
            id: $notification->getAttribute('id'),
            title: $this->text($data['title'] ?? $data['message'] ?? $data['subject'] ?? null, $data, $translationMode, $locale),
            body: $this->text($data['body'] ?? (($data['title'] ?? null) ? ($data['message'] ?? null) : null), $data, $translationMode, $locale),
            icon: $data['icon'] ?? null,
            variant: is_string($variant) ? Variant::tryFrom($variant) : null,
            href: $data['href'] ?? null,
            isRead: $notification->getAttribute('read_at') !== null,
            createdAt: $notification->getAttribute('created_at')?->toIso8601String(),
            actions: array_values(array_filter(array_map(
                ActionDescriptor::materialize(...),
                $data['actions'] ?? [],
            ))),
        );
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function text(
        mixed $value,
        array $data,
        NotificationTranslationMode $translationMode,
        ?string $locale,
    ): string|Translatable|null {
        $translatable = Translatable::tryFromWire($value);

        if (! $translatable instanceof Translatable) {
            return is_string($value) ? $value : null;
        }

        if ($translationMode === NotificationTranslationMode::Wire) {
            return $translatable;
        }

        $translation = $this->translator->get(
            Str::replaceFirst(':', '.', $translatable->key),
            $this->replacements($translatable, $data),
            $locale,
        );

        return is_string($translation) ? $translation : $translatable->key;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, string|int|float|bool>
     */
    private function replacements(Translatable $translatable, array $data): array
    {
        $replacements = $translatable->replacements;

        foreach ($translatable->payload as $name => $path) {
            $value = Arr::get($data, $path);

            if (is_string($value) || is_int($value) || is_float($value) || is_bool($value)) {
                $replacements[$name] = $value;
            }
        }

        return $replacements;
    }
}
