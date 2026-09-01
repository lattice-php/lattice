<?php
declare(strict_types=1);

namespace Lattice\Form\Components;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Collection;
use Lattice\Core\Attributes\AsComponent;
use Lattice\Core\Attributes\SerializationHook;
use Lattice\Core\Contracts\FormRootComponent;
use Lattice\Core\Contracts\InteractiveComponent;
use Lattice\Form\Contracts\ProvidesAffixFields;
use Lattice\Form\Contracts\ProvidesRowFields;
use Lattice\Form\FormData;
use Lattice\Form\FormDefinition;
use Lattice\Form\FormRegistry;
use Lattice\Ui\Components\Button;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Components\ContainerComponent;
use Lattice\Ui\Components\IsInteractive;
use Lattice\Ui\Concerns\HasHttpMethod;
use Lattice\Ui\Enums\Emphasis;
use Lattice\Ui\Enums\Justify;
use Lattice\Ui\Enums\Variant;
use LogicException;

#[AsComponent('form')]
class Form extends ContainerComponent implements FormRootComponent, InteractiveComponent
{
    use HasHttpMethod;
    use IsInteractive;

    public const DEFAULT_VALIDATION_DEBOUNCE_MS = 1500;

    public ?string $action = null;

    public ?string $submitLabel = null;

    public string $validationSummaryLabel;

    public bool $precognitive = false;

    public ?int $validationTimeout = null;

    public bool $async = false;

    public bool $submitButton = true;

    public ?Justify $submitJustify = null;

    public ?Variant $submitVariant = null;

    public ?Emphasis $submitEmphasis = null;

    /**
     * @var array<int, Button>|null
     */
    public ?array $submitButtons = null;

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

    public function __construct(?string $key = null)
    {
        parent::__construct($key);

        $this->validationSummaryLabel = __('lattice::form.validation-summary');
    }

    public static function make(string $id): static
    {
        return (new static)->id($id);
    }

    /**
     * @param  class-string<FormDefinition>  $form
     * @param  array<string, mixed>  $context
     */
    public static function use(string $form, array $context = []): static
    {
        /** @var static $registered */
        $registered = app(FormRegistry::class)->component($form, $context);

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

    public function submitJustify(Justify $justify): static
    {
        $this->submitJustify = $justify;

        return $this;
    }

    public function submitVariant(Variant $variant): static
    {
        $this->submitVariant = $variant;

        return $this;
    }

    public function submitEmphasis(Emphasis $emphasis): static
    {
        $this->submitEmphasis = $emphasis;

        return $this;
    }

    public function submitButtons(Button ...$buttons): static
    {
        $this->submitButtons = array_values($buttons);

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

    /**
     * Submit over fetch and apply the response's effects in place — no Inertia
     * visit, no page re-render, no scroll movement. The handler's LatticeResponse
     * arrives as an effects JSON body; an explicit redirect becomes a redirect
     * effect. Validation runs the same 422/Precognition path modal action forms
     * use, so `errorBag()` has no meaning here.
     */
    public function async(bool $async = true): static
    {
        $this->async = $async;

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
            ->flatMap(fn (Field $field): array => [
                $field,
                ...($field instanceof ProvidesAffixFields ? $field->affixFields() : []),
            ])
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
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 190)]
    protected function configureWizard(array $data): array
    {
        $children = $this->resolvedChildren();
        $hasRootWizard = count($children) === 1 && $children[0] instanceof Wizard;
        $wizardCount = collect($this->descendants())
            ->filter(fn (Component $component): bool => $component instanceof Wizard)
            ->count();

        if ($wizardCount > 1 || ($wizardCount === 1 && ! $hasRootWizard)) {
            throw new LogicException('A wizard must be the sole root child of its form schema.');
        }

        if ($hasRootWizard) {
            $this->submitButton = false;
        }

        return $data;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 185)]
    protected function guardAsyncUploads(array $data): array
    {
        if ($this->async && $this->fields()->contains(fn (Field $field): bool => $field instanceof FileUpload)) {
            throw new LogicException(
                'An async form cannot contain file uploads: the fetch submit sends JSON, not multipart form data.',
            );
        }

        return $data;
    }

    /**
     * Distribute filled state before children are serialized, so a field can
     * react to its stored value (e.g. a Select resolving labels for ids).
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 250)]
    protected function hydrateFieldsFromState(array $data): array
    {
        $form = FormData::make($this->state);
        $request = request();

        foreach ($this->fields() as $component) {
            if (! array_key_exists($component->name(), $this->state)) {
                continue;
            }

            $component->hydrateState($this->state[$component->name()], $form, $request);

            if ($component instanceof ProvidesRowFields) {
                $component->prefillRowFields($this->state[$component->name()], $form, $request);
            }
        }

        return $data;
    }
}
