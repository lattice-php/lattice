<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\IsInteractive;

function makeInteractiveComponent(?string $endpoint = null): Component
{
    $component = new class extends Component
    {
        use IsInteractive;

        public ?string $endpoint = null;

        protected function type(): string
        {
            return 'test.interactive';
        }
    };

    $component->endpoint = $endpoint;

    return $component;
}

it('serialises an interactive component without an id instead of crashing', function (): void {
    expect(wire(makeInteractiveComponent()))->not->toHaveKey('id');
});

it('throws a clear error when an interactive component with an endpoint has no id', function (): void {
    $component = makeInteractiveComponent('/run');

    expect(fn (): array => wire($component))
        ->toThrow(LogicException::class, 'must be given an id()');
});
