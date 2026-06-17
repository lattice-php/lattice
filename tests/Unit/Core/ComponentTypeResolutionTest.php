<?php
declare(strict_types=1);

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Core\Components\Component;

#[AsComponent('test.widget')]
class TypeResolutionWidget extends Component
{
    #[Override]
    protected function type(): string
    {
        return parent::type();
    }
}

it('resolves the wire type from the AsComponent attribute', function (): void {
    expect((new TypeResolutionWidget)->jsonSerialize()['type'])->toBe('test.widget');
});

it('throws a clear error when the attribute is missing', function (): void {
    $component = new class extends Component
    {
        protected function type(): string
        {
            return parent::type();
        }
    };

    expect(fn (): array => $component->jsonSerialize())
        ->toThrow(LogicException::class, 'missing the #[AsComponent] attribute');
});
