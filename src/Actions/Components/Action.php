<?php
declare(strict_types=1);

namespace Lattice\Lattice\Actions\Components;

use BackedEnum;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionRegistry;
use Lattice\Lattice\Actions\Confirmation;
use Lattice\Lattice\Attributes;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\IsInteractive;
use Lattice\Lattice\Core\Concerns\HasHttpMethod;
use Lattice\Lattice\Core\Concerns\HasVariant;
use Lattice\Lattice\Effects\Contracts\Effect;
use Lattice\Lattice\Forms\Components\Field;
use Lattice\Lattice\Forms\Components\Form;

#[Attributes\Component('action')]
class Action extends Component
{
    use HasHttpMethod;
    use HasVariant;
    use IsInteractive;

    public ?string $endpoint = null;

    public ?string $label = null;

    public ?string $icon = null;

    /**
     * The confirmation dialog shown before the action runs, or `null` until
     * {@see confirm()} sets one.
     */
    public ?Confirmation $confirmation = null;

    /**
     * @var array<int, Effect>
     */
    public array $effects = [];

    public ?Form $form = null;

    public ?bool $lazyForm = null;

    public static function make(string $id): static
    {
        return (new static)->id($id);
    }

    /**
     * @param  class-string<ActionDefinition>  $action
     */
    public static function use(string $action): static
    {
        /** @var static $registered */
        $registered = app(ActionRegistry::class)->component($action);

        return clone $registered;
    }

    public function endpoint(string $endpoint): static
    {
        $this->endpoint = $endpoint;

        return $this;
    }

    public function label(string $label): static
    {
        $this->label = $label;

        return $this;
    }

    public function icon(BackedEnum|string $icon): static
    {
        $this->icon = $this->enumValue($icon);

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
     * @param  array<int, Effect>  $effects
     */
    public function effects(array $effects): static
    {
        $this->effects = $effects;

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
    #[Attributes\SerializationHook(priority: 250)]
    protected function stripLazyFormSchema(array $data): array
    {
        if ($this->lazyForm === true) {
            $data['props']['form'] = null;
        }

        return $data;
    }
}
