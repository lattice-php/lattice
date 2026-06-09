<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Forms;

use Bambamboole\Lattice\Attributes\ComponentAttribute;
use Bambamboole\Lattice\Attributes\Form;
use Bambamboole\Lattice\DefinitionRegistry;
use Bambamboole\Lattice\Forms\Components\Form as FormComponent;
use Illuminate\Http\Request;

/**
 * @extends DefinitionRegistry<FormDefinition>
 */
final class FormRegistry extends DefinitionRegistry
{
    /**
     * @param  class-string<FormDefinition>  $form
     */
    public function component(string $form): FormComponent
    {
        $key = $this->registeredKeyFor($form);

        return $this->make($form)
            ->definition(FormComponent::make($key), $this->container->make(Request::class))
            ->action($this->endpointFor($key))
            ->prop('errorBag', $this->errorBagFor($key));
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
     * @return class-string<ComponentAttribute>
     */
    protected function attributeClass(): string
    {
        return Form::class;
    }

    protected function name(): string
    {
        return 'form';
    }

    protected function group(): string
    {
        return 'forms';
    }
}
