<?php
declare(strict_types=1);

namespace Lattice\Lattice\Search;

use JsonSerializable;

final readonly class SearchResultItem implements JsonSerializable
{
    public function __construct(
        public string $id,
        public string $title,
        public string $link,
        public ?string $subtitle = null,
        public ?string $additionalInfo = null,
        public ?string $badge = null,
    ) {}

    /** @return array{id:string,title:string,subtitle:?string,additionalInfo:?string,link:string,badge:?string} */
    public function jsonSerialize(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'additionalInfo' => $this->additionalInfo,
            'link' => $this->link,
            'badge' => $this->badge,
        ];
    }
}
