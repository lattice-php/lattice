<?php
declare(strict_types=1);

namespace Lattice\Lattice\Layouts;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsLayout;
use Lattice\Lattice\Attributes\DefinitionAttribute;
use Lattice\Lattice\Core\DefinitionRegistry;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Ui\Components\Component;

/**
 * @extends DefinitionRegistry<LayoutDefinition>
 */
final class LayoutRegistry extends DefinitionRegistry
{
    /**
     * @return array{key: string, schema: array<int, Component>}
     */
    public function render(string $key, Request $request): array
    {
        $definition = $this->resolve($key);

        return [
            'key' => $key,
            'schema' => $definition
                ->schema(PageSchema::make(), $request)
                ->renderable(),
        ];
    }

    /**
     * @return class-string<LayoutDefinition>
     */
    protected function definitionClass(): string
    {
        return LayoutDefinition::class;
    }

    /**
     * @return class-string<DefinitionAttribute>
     */
    public function attributeClass(): string
    {
        return AsLayout::class;
    }

    protected function name(): string
    {
        return 'layout';
    }

    public function group(): string
    {
        return 'layouts';
    }
}
