<?php
declare(strict_types=1);

namespace Lattice\Lattice\Actions\Components;

use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionRegistry;
use Lattice\Lattice\Actions\Confirmation;
use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Forms\Components\Field;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Ui\Components\Component;
use Lattice\Lattice\Ui\Components\IsInteractive;
use Lattice\Lattice\Ui\Concerns\FiltersRenderableComponents;
use Lattice\Lattice\Ui\Concerns\HasHttpMethod;
use Lattice\Lattice\Ui\Concerns\HasIcon;
use Lattice\Lattice\Ui\Concerns\HasLabel;
use Lattice\Lattice\Ui\Concerns\HasVariant;

#[AsComponent('action')]
class Action extends Component
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
        string $title,
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
