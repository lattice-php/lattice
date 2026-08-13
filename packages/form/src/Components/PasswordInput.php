<?php
declare(strict_types=1);

namespace Lattice\Form\Components;

use Lattice\Form\Attributes\AsField;
use Lattice\Form\Enums\FieldType;
use Lattice\Ui\Concerns\HasAffixes;
use Lattice\Ui\Concerns\HasAutoComplete;
use Lattice\Ui\Concerns\HasAutoFocus;
use Lattice\Ui\Concerns\HasPlaceholder;
use Lattice\Ui\Concerns\HasTabIndex;

#[AsField(FieldType::PasswordInput)]
class PasswordInput extends Field
{
    use HasAffixes;
    use HasAutoComplete;
    use HasAutoFocus;
    use HasPlaceholder;
    use HasTabIndex;

    public ?string $passwordRules = null;

    /**
     * @var array{label: string, name: string, placeholder: string}|null
     */
    public ?array $confirmation = null;

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
