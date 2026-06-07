<?php

namespace Bambamboole\Lattice;

use BackedEnum;
use BadMethodCallException;
use Bambamboole\Lattice\Enums\PageContainer;
use Bambamboole\Lattice\Enums\PageLayout;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use UnexpectedValueException;

abstract class Page
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

    public function __invoke(Request $request): Response
    {
        if (! method_exists($this, 'render')) {
            throw new BadMethodCallException(sprintf(
                'Method %s::render does not exist.',
                static::class,
            ));
        }

        $this->boot($request);

        $schema = $this->{'render'}(PageSchema::make());

        if (! $schema instanceof PageSchema) {
            throw new UnexpectedValueException(sprintf(
                'Method %s::render must return an instance of %s.',
                static::class,
                PageSchema::class,
            ));
        }

        return $this->response($schema);
    }

    /**
     * @param  array<int, mixed>  $parameters
     */
    public function callAction(string $method, array $parameters): Response
    {
        if (! method_exists($this, $method)) {
            throw new BadMethodCallException(sprintf(
                'Method %s::%s does not exist.',
                static::class,
                $method,
            ));
        }

        $this->boot(app(Request::class));

        $schema = $this->{$method}(...array_values($parameters));

        if (! $schema instanceof PageSchema) {
            throw new UnexpectedValueException(sprintf(
                'Method %s::%s must return an instance of %s.',
                static::class,
                $method,
                PageSchema::class,
            ));
        }

        return $this->response($schema);
    }

    protected function component(): string
    {
        return 'lattice/page';
    }

    protected function boot(Request $request): void {}

    /**
     * @return array{title: string|null, layout: string, container: string, components: array<int, array<string, mixed>>}
     */
    public function toArray(PageSchema $schema): array
    {
        return [
            'title' => $this->title(),
            'layout' => $this->serializePageMetadata($this->layout()),
            'container' => $this->serializePageMetadata($this->container()),
            'components' => $schema->toArray(),
        ];
    }

    private function response(PageSchema $schema): Response
    {
        return Inertia::render($this->component(), [
            'lattice' => $this->toArray($schema),
        ]);
    }

    private function serializePageMetadata(BackedEnum|string $value): string
    {
        return $value instanceof BackedEnum ? (string) $value->value : $value;
    }
}
