<?php
declare(strict_types=1);

use Lattice\Lattice\Attributes\Component as ComponentAttribute;
use Lattice\Lattice\Core\Components\Component;

#[ComponentAttribute('test.widget')]
class TypeResolutionWidget extends Component
{
    protected function type(): string
    {
        return parent::type();
    }
}

it('resolves the wire type from the Component attribute', function () {
    expect((new TypeResolutionWidget)->jsonSerialize()['type'])->toBe('test.widget');
});

it('throws a clear error when the attribute is missing', function () {
    $component = new class extends Component
    {
        protected function type(): string
        {
            return parent::type();
        }
    };

    expect(fn () => $component->jsonSerialize())
        ->toThrow(LogicException::class, 'missing the #[Component] attribute');
});
