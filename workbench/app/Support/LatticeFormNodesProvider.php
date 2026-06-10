<?php

declare(strict_types=1);

namespace Workbench\App\Support;

use Spatie\TypeScriptTransformer\References\CustomReference;
use Spatie\TypeScriptTransformer\Transformed\Transformed;
use Spatie\TypeScriptTransformer\TransformedProviders\TransformedProvider;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptAlias;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptRaw;

/**
 * Emits the discriminated FormNode union that ties each form component's wire
 * `type` string to its generated props type. The field list is driven by the
 * class-string => wire-type map so it stays in sync with the registered
 * components instead of being hardcoded here.
 */
final class LatticeFormNodesProvider implements TransformedProvider
{
    /**
     * @param  array<class-string, string>  $fields  Form field components keyed by class-string, valued by wire type.
     * @param  class-string  $formClass
     */
    public function __construct(
        private readonly array $fields,
        private readonly string $formClass,
        private readonly string $formType = 'form',
    ) {}

    /**
     * @return array<Transformed>
     */
    public function provide(): array
    {
        return [
            $this->alias('FormFieldNode', $this->fieldUnion()),
            $this->alias('FormNode', $this->nodeUnion()),
            $this->alias('FormNodeType', 'FormNode["type"]'),
        ];
    }

    private function fieldUnion(): string
    {
        $members = [];

        foreach ($this->fields as $class => $type) {
            $members[] = sprintf('  | { type: "%s"; key?: string; props: %s }', $type, class_basename($class));
        }

        return "\n".implode("\n", $members);
    }

    private function nodeUnion(): string
    {
        $formMember = sprintf(
            '  | { type: "%s"; key?: string; id?: string; props: %s; schema?: FormFieldNode[] }',
            $this->formType,
            class_basename($this->formClass),
        );

        return "\n  | FormFieldNode\n".$formMember;
    }

    private function alias(string $name, string $body): Transformed
    {
        return new Transformed(
            new TypeScriptAlias($name, new TypeScriptRaw($body)),
            new CustomReference('lattice-form-nodes', $name),
            [],
        );
    }
}
