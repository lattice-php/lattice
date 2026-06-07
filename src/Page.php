<?php

namespace Bambamboole\Lattice;

use BackedEnum;
use Bambamboole\Lattice\Enums\PageContainer;
use Bambamboole\Lattice\Enums\PageLayout;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use JsonSerializable;

abstract class Page implements JsonSerializable
{
    public function title(): ?string
    {
        return null;
    }

    public function layout(): PageLayout|string
    {
        return PageLayout::None;
    }

    public function container(): PageContainer|string
    {
        return PageContainer::Centered;
    }

    abstract public function content(PageSchema $schema): PageSchema;

    public function __invoke(Request $request): Response
    {
        $this->boot($request);

        return Inertia::render($this->component(), [
            'lattice' => $this->toArray(),
        ]);
    }

    protected function component(): string
    {
        return 'lattice/page';
    }

    protected function boot(Request $request): void {}

    /**
     * @return array{title: string|null, layout: string, container: string, components: array<int, array<string, mixed>>}
     */
    public function toArray(): array
    {
        return [
            'title' => $this->title(),
            'layout' => $this->serializePageMetadata($this->layout()),
            'container' => $this->serializePageMetadata($this->container()),
            'components' => $this->content(PageSchema::make())->toArray(),
        ];
    }

    /**
     * @return array{title: string|null, layout: string, container: string, components: array<int, array<string, mixed>>}
     */
    public function jsonSerialize(): array
    {
        return $this->toArray();
    }

    private function serializePageMetadata(BackedEnum|string $value): string
    {
        return $value instanceof BackedEnum ? (string) $value->value : $value;
    }
}
