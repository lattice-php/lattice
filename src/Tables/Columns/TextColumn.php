<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Tables\Columns;

class TextColumn extends Column
{
    /**
     * @var array{format: string|null}|null
     */
    protected ?array $date = null;

    protected bool $copyable = false;

    /**
     * @var array{href: string|null, external: bool}|null
     */
    protected ?array $link = null;

    public function date(?string $format = null): static
    {
        $this->date = ['format' => $format];

        return $this;
    }

    public function copyable(bool $copyable = true): static
    {
        $this->copyable = $copyable;

        return $this;
    }

    public function link(?string $href = null, bool $external = false): static
    {
        $this->link = [
            'href' => $href,
            'external' => $external,
        ];

        return $this;
    }

    /**
     * @return array<string, mixed>
     */
    #[\Override]
    public function toArray(): array
    {
        return array_filter([
            ...parent::toArray(),
            'type' => 'text',
            'date' => $this->date,
            'copyable' => $this->copyable ?: null,
            'link' => $this->link,
        ], fn (mixed $value): bool => $value !== null);
    }
}
