<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Forms\Attributes\AsField;
use Lattice\Lattice\Forms\Enums\FieldType;
use Lattice\Lattice\Ui\Concerns\HasAffixes;
use Lattice\Lattice\Ui\Concerns\HasAutoComplete;
use Lattice\Lattice\Ui\Concerns\HasAutoFocus;
use Lattice\Lattice\Ui\Concerns\HasPlaceholder;
use Lattice\Lattice\Ui\Concerns\HasTabIndex;

#[AsField(FieldType::PasswordInput)]
class PasswordInput extends Field
{
    use HasAffixes;
    use HasAutoComplete;
    use HasAutoFocus;
    use HasPlaceholder;
    use HasTabIndex;

    public ?string $passwordRules = null;

    public ?LabelAction $labelAction = null;

    /**
     * @var array{label: string, name: string, placeholder: string}|null
     */
    public ?array $confirmation = null;

    public function labelAction(string $label, string $href, ?int $tabIndex = null): static
    {
        $this->labelAction = new LabelAction($href, $label, $tabIndex);

        return $this;
    }

    public function passwordRules(string $passwordRules): static
    {
        $this->passwordRules = $passwordRules;

        return $this;
    }

    public function needsConfirmation(?string $label = null, ?string $placeholder = null): static
    {
        $this->confirmation = [
            'label' => $label ?? 'Confirm password',
            'name' => $this->name.'_confirmation',
            'placeholder' => $placeholder ?? $label ?? 'Confirm password',
        ];

        return $this;
    }
}
