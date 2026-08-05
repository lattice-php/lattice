<?php
declare(strict_types=1);

namespace Lattice\Actions\Components;

use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionRegistry;
use Lattice\Actions\Confirmation;
use Lattice\Core\Attributes\AsComponent;
use Lattice\Core\Attributes\SerializationHook;
use Lattice\Core\Contracts\InteractiveComponent;
use Lattice\Form\Components\Field;
use Lattice\Form\Components\Form;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Components\IsInteractive;
use Lattice\Ui\Concerns\FiltersRenderableComponents;
use Lattice\Ui\Concerns\HasHttpMethod;
use Lattice\Ui\Concerns\HasIcon;
use Lattice\Ui\Concerns\HasLabel;
use Lattice\Ui\Concerns\HasVariant;
use Lattice\Ui\Enums\ModalWidth;
use Lattice\Ui\Enums\Side;

#[AsComponent('action')]
class Action extends Component implements InteractiveComponent
{
    use HasHttpMethod;
    use HasIcon;
    use HasLabel;
    use HasVariant;
    use IsInteractive;

    public ?string $endpoint = null;

    public ?Confirmation $confirmation = null;

    public ?Form $form = null;

    public bool $lazyForm = false;

    public ?Side $modalSide = null;

    public ?ModalWidth $modalWidth = null;

    public static function make(string $id): static
    {
        return (new static)->id($id);
    }

    /**
     * @param  class-string<ActionDefinition>  $action
     * @param  array<string, mixed>  $context
     */
    public static function use(string $action, array $context = []): static
    {
        /** @var static $registered */
        $registered = app(ActionRegistry::class)->component($action, $context);

        return clone $registered;
    }

    public function endpoint(string $endpoint): static
    {
        $this->endpoint = $endpoint;

        return $this;
    }

    public function confirm(
        ?string $title = null,
        ?string $description = null,
        ?string $confirmLabel = null,
        ?string $cancelLabel = null,
    ): static {
        $this->confirmation = new Confirmation($title, $description, $confirmLabel, $cancelLabel);

        return $this;
    }

    /**
     * Attach a form schema rendered in a modal before the action runs. The
     * collected values are posted to the action endpoint and validated server-side.
     *
     * @param  array<int, Field>  $fields
     */
    public function form(array $fields): static
    {
        $this->form = Form::make(($this->id ?? 'action').'-form')
            ->schema($fields)
            ->precognitive();

        return $this;
    }

    /**
     * Defer the form schema: ship a flag instead of the schema and let the client
     * fetch it (prefilled, per record) from the action endpoint when the modal opens.
     */
    public function lazyForm(): static
    {
        $this->lazyForm = true;

        return $this;
    }

    /**
     * Present the attached form modal as a slide-out sheet instead of a centered dialog.
     */
    public function slideOut(Side $side = Side::End): static
    {
        $this->modalSide = $side;

        return $this;
    }

    public function modalWidth(ModalWidth $width): static
    {
        $this->modalWidth = $width;

        return $this;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 250)]
    protected function stripLazyFormSchema(array $data): array
    {
        if ($this->lazyForm) {
            $data['props']['form'] = null;
        }

        return $data;
    }

    /**
     * An unauthorized (or explicitly hidden) attached form has no filter point of its own
     * once embedded in `props.form` — it never reaches a collect-time pass like
     * {@see FiltersRenderableComponents}. Drop it here, at the seam where it is embedded.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 250)]
    protected function stripUnauthorizedForm(array $data): array
    {
        if ($this->form instanceof Form && ! $this->form->shouldRender()) {
            $data['props']['form'] = null;
        }

        return $data;
    }
}
