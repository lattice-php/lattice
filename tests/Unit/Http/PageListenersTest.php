<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Http\Page;
use Lattice\Lattice\Realtime\Listen;
use Lattice\Lattice\Ui\Components\Text;

test('pages serialize declared listeners when realtime is enabled', function (): void {
    config()->set('lattice.realtime.enabled', true);

    $page = new class extends Page
    {
        protected function listeners(): array
        {
            return [
                Listen::private('orders')->on('OrderShipped')->toast('Shipped'),
            ];
        }

        public function render(PageSchema $schema): PageSchema
        {
            return $schema->component(Text::make('Orders'));
        }
    };

    $array = $page->toArray($page->render(PageSchema::make()), new Request);

    expect($array['listeners'])->toHaveCount(1)
        ->and($array['listeners'][0])->toMatchArray([
            'channel' => 'orders',
            'visibility' => 'private',
            'events' => ['OrderShipped'],
        ]);
});

test('pages send null listeners when none are declared', function (): void {
    config()->set('lattice.realtime.enabled', true);

    $page = new class extends Page
    {
        public function render(PageSchema $schema): PageSchema
        {
            return $schema->component(Text::make('Plain'));
        }
    };

    expect($page->toArray($page->render(PageSchema::make()), new Request))
        ->toHaveKey('listeners', null);
});

test('pages send null listeners when realtime is disabled', function (): void {
    config()->set('lattice.realtime.enabled', false);

    $page = new class extends Page
    {
        protected function listeners(): array
        {
            return [
                Listen::private('orders')->on('OrderShipped')->toast('Shipped'),
            ];
        }

        public function render(PageSchema $schema): PageSchema
        {
            return $schema->component(Text::make('Orders'));
        }
    };

    expect($page->toArray($page->render(PageSchema::make()), new Request))
        ->toHaveKey('listeners', null);
});
