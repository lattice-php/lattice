<?php

declare(strict_types=1);

use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\IsInteractive;

function makeInteractiveComponent(): Component
{
    return new class extends Component
    {
        use IsInteractive;

        protected function type(): string
        {
            return 'test.interactive';
        }
    };
}

it('serialises an interactive component without an id instead of crashing', function (): void {
    expect(makeInteractiveComponent()->toArray())->not->toHaveKey('id');
});

it('throws a clear error when an interactive component with an endpoint has no id', function (): void {
    $component = makeInteractiveComponent()->prop('endpoint', '/run');

    expect(fn (): array => $component->toArray())
        ->toThrow(LogicException::class, 'must be given an id()');
});
