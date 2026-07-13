<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects\Concerns;

use Lattice\Lattice\Effects\Builtin\Callout;
use Lattice\Lattice\Effects\Builtin\Toast;
use Lattice\Lattice\Effects\Contracts\Effect as EffectContract;
use Lattice\Lattice\Facades\Effects;
use Lattice\Lattice\I18n\Values\Translatable;
use Lattice\Lattice\Ui\Enums\Variant;

trait QueuesEffects
{
    abstract public function effect(EffectContract $effect): static;

    public function toast(string|Translatable|Toast|Variant $message, Variant|string|null $variant = null): static
    {
        return $this->effect(Effects::toast($message, $variant));
    }

    public function callout(Callout $callout): static
    {
        return $this->effect(Effects::callout($callout));
    }

    public function reloadComponent(string $component): static
    {
        return $this->effect(Effects::reloadComponent($component));
    }

    public function reloadPage(): static
    {
        return $this->effect(Effects::reloadPage());
    }

    public function openModal(string $modal): static
    {
        return $this->effect(Effects::openModal($modal));
    }

    public function closeModal(?string $modal = null): static
    {
        return $this->effect(Effects::closeModal($modal));
    }

    public function resetForm(?string $form = null): static
    {
        return $this->effect(Effects::resetForm($form));
    }

    public function localeChange(string $locale): static
    {
        return $this->effect(Effects::localeChange($locale));
    }

    public function download(string $url): static
    {
        return $this->effect(Effects::download($url));
    }

    public function toggleSidebar(?string $target = null): static
    {
        return $this->effect(Effects::toggleSidebar($target));
    }
}
