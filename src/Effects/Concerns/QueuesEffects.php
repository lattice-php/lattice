<?php
declare(strict_types=1);

namespace Lattice\Effects\Concerns;

use Lattice\Effects\Builtin\Callout;
use Lattice\Effects\Builtin\Toast;
use Lattice\Facades\Effects;
use Lattice\I18n\Values\Translatable;
use Lattice\Ui\Effects\Effect;
use Lattice\Ui\Enums\Variant;

trait QueuesEffects
{
    abstract public function effect(Effect $effect): static;

    public function toast(string|Translatable|Toast $message, Variant $variant = Variant::Success): static
    {
        return $this->effect(Effects::toast($message, $variant));
    }

    public function callout(Callout $callout): static
    {
        return $this->effect($callout);
    }

    public function retractCallout(string $key): static
    {
        return $this->effect(Callout::retract($key));
    }

    public function reloadComponent(string $component): static
    {
        return $this->effect(Effects::reloadComponent($component));
    }

    public function reloadPage(bool $full = false): static
    {
        return $this->effect(Effects::reloadPage($full));
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
