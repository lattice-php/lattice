<?php

declare(strict_types=1);

namespace Lattice\Lattice\Actions;

use JsonSerializable;
use Lattice\Lattice\Actions\Components\Action;

/**
 * The confirmation dialog an action shows before it runs. Built by {@see Action::confirm()}
 * and generated to TypeScript; an action without a confirmation serializes to
 * `null` rather than this object.
 */
final readonly class Confirmation implements JsonSerializable
{
    public function __construct(
        public string $title,
        public ?string $description = null,
        public ?string $confirmLabel = null,
        public ?string $cancelLabel = null,
    ) {}

    /**
     * @return array{title: string, description: string|null, confirmLabel: string|null, cancelLabel: string|null}
     */
    public function jsonSerialize(): array
    {
        return [
            'title' => $this->title,
            'description' => $this->description,
            'confirmLabel' => $this->confirmLabel,
            'cancelLabel' => $this->cancelLabel,
        ];
    }
}
