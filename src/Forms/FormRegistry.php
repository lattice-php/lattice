<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Attributes\DefinitionAttribute;
use Lattice\Lattice\Core\DefinitionRegistry;
use Lattice\Lattice\Forms\Components\Form as FormComponent;

/**
 * @extends DefinitionRegistry<FormDefinition>
 */
final class FormRegistry extends DefinitionRegistry
{
    /**
     * @param  class-string<FormDefinition>  $form
     * @param  array<string, mixed>  $context
     */
    public function component(string $form, array $context = []): FormComponent
    {
        $key = $this->registeredKeyFor($form);

        $component = FormComponent::make($key)->signedAs($key)->context($context);

        return $this->make($form)
            ->withContext($context)
            ->definition($component, $this->container->make(Request::class))
            ->action($this->endpointFor($key))
            ->errorBag($this->errorBagFor($key));
    }

    public function errorBagFor(string $id): string
    {
        return (string) preg_replace('/[^A-Za-z0-9_]+/', '_', $id);
    }

    /**
     * @return class-string<FormDefinition>
     */
    protected function definitionClass(): string
    {
        return FormDefinition::class;
    }

    /**
     * @return class-string<DefinitionAttribute>
     */
    public function attributeClass(): string
    {
        return AsForm::class;
    }

    protected function name(): string
    {
        return 'form';
    }

    public function group(): string
    {
        return 'forms';
    }
}
