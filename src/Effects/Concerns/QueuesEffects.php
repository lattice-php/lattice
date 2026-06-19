<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects\Concerns;

use Lattice\Lattice\Core\Enums\Variant;
use Lattice\Lattice\Core\Values\Callout;
use Lattice\Lattice\Core\Values\ToastMessage;
use Lattice\Lattice\Core\Values\Translatable;
use Lattice\Lattice\Effects\Contracts\Effect as EffectContract;
use Lattice\Lattice\Effects\Effect;

trait QueuesEffects
{
    abstract public function effect(EffectContract $effect): static;

    public function toast(string|Translatable|ToastMessage|Variant $message, Variant|string|null $variant = null): static
    {
        return $this->effect(Effect::toast($message, $variant));
    }

    public function callout(Callout $callout): static
    {
        return $this->effect(Effect::callout($callout));
    }

    public function reloadComponent(string $component): static
    {
        return $this->effect(Effect::reloadComponent($component));
    }

    public function reloadPage(): static
    {
        return $this->effect(Effect::reloadPage());
    }

    public function openModal(string $modal): static
    {
        return $this->effect(Effect::openModal($modal));
    }

    public function closeModal(?string $modal = null): static
    {
        return $this->effect(Effect::closeModal($modal));
    }

    public function resetForm(?string $form = null): static
    {
        return $this->effect(Effect::resetForm($form));
    }

    public function localeChange(string $locale): static
    {
        return $this->effect(Effect::localeChange($locale));
    }

    public function download(string $url): static
    {
        return $this->effect(Effect::download($url));
    }

    public function toggleSidebar(?string $target = null): static
    {
        return $this->effect(Effect::toggleSidebar($target));
    }
}
