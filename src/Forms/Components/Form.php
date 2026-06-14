<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Collection;
use Lattice\Lattice\Attributes;
use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\ContainerComponent;
use Lattice\Lattice\Core\Components\IsInteractive;
use Lattice\Lattice\Core\Concerns\HasHttpMethod;
use Lattice\Lattice\Forms\Contracts\ProvidesRowFields;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Forms\FormRegistry;

#[Attributes\Component('form')]
class Form extends ContainerComponent
{
    use HasHttpMethod;
    use IsInteractive;

    public const DEFAULT_VALIDATION_DEBOUNCE_MS = 1500;

    public ?string $action = null;

    public ?string $submitLabel = null;

    public string $validationSummaryLabel = 'Fix these fields to continue:';

    public bool $precognitive = false;

    public ?int $validationTimeout = null;

    public bool $submitButton = true;

    /**
     * @var array<int, string>|bool|null
     */
    public array|bool|null $resetOnSuccess = null;

    /**
     * @var array<int, string>|bool|null
     */
    public array|bool|null $resetOnError = null;

    public ?string $status = null;

    public ?string $errorBag = null;

    /**
     * @var array<string, mixed>
     */
    public array $state = [];

    public static function make(string $id): static
    {
        return (new static)->id($id);
    }

    /**
     * @param  class-string<FormDefinition>  $form
     */
    public static function use(string $form): static
    {
        /** @var static $registered */
        $registered = app(FormRegistry::class)->component($form);

        return clone $registered;
    }

    public function action(string $action): static
    {
        $this->action = $action;

        return $this;
    }

    public function submitLabel(string $submitLabel): static
    {
        $this->submitLabel = $submitLabel;

        return $this;
    }

    public function validationSummaryLabel(string $label): static
    {
        $this->validationSummaryLabel = $label;

        return $this;
    }

    /**
     * @param  Arrayable<array-key, mixed>|array<string, mixed>  $state
     */
    public function fill(Arrayable|array $state): static
    {
        $this->state = $state instanceof Arrayable ? $state->toArray() : $state;

        return $this;
    }

    public function precognitive(int $debounceMs = self::DEFAULT_VALIDATION_DEBOUNCE_MS): static
    {
        $this->precognitive = true;
        $this->validationTimeout = $debounceMs;

        return $this;
    }

    public function withoutSubmitButton(): static
    {
        $this->submitButton = false;

        return $this;
    }

    /**
     * @internal
     */
    public function errorBag(string $errorBag): static
    {
        $this->errorBag = $errorBag;

        return $this;
    }

    /**
     * @return Collection<int, Field>
     */
    public function fields(): Collection
    {
        return collect($this->descendants())
            ->filter(fn (Component $component): bool => $component instanceof Field)
            ->values();
    }

    /**
     * @param  array<int, string>|bool  $fields
     */
    public function resetOnSuccess(array|bool $fields = true): static
    {
        $this->resetOnSuccess = $fields;

        return $this;
    }

    /**
     * @param  array<int, string>|bool  $fields
     */
    public function resetOnError(array|bool $fields = true): static
    {
        $this->resetOnError = $fields;

        return $this;
    }

    public function status(?string $status): static
    {
        if ($status === null) {
            return $this;
        }

        $this->status = $status;

        return $this;
    }

    /**
     * Distribute the filled state to fields before children are serialized, so a
     * field can react to its stored value (e.g. a Select resolving labels for ids).
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 250)]
    protected function prefillFields(array $data): array
    {
        foreach ($this->descendants() as $component) {
            if (! $component instanceof Field || ! array_key_exists($component->name(), $this->state)) {
                continue;
            }

            $component->prefill($this->state[$component->name()]);

            if ($component instanceof ProvidesRowFields) {
                $component->prefillRowFields($this->state[$component->name()]);
            }
        }

        return $data;
    }
}
