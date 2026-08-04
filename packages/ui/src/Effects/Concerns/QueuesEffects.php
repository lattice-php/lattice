<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects\Concerns;

use Lattice\Lattice\Effects\Builtin\Callout;
use Lattice\Lattice\Effects\Builtin\CloseModal;
use Lattice\Lattice\Effects\Builtin\Download;
use Lattice\Lattice\Effects\Builtin\LocaleChange;
use Lattice\Lattice\Effects\Builtin\OpenModal;
use Lattice\Lattice\Effects\Builtin\ReloadComponent;
use Lattice\Lattice\Effects\Builtin\ReloadPage;
use Lattice\Lattice\Effects\Builtin\ResetForm;
use Lattice\Lattice\Effects\Builtin\Toast;
use Lattice\Lattice\Effects\Builtin\ToggleSidebar;
use Lattice\Lattice\Effects\Effect;
use Lattice\Lattice\I18n\Values\Translatable;
use Lattice\Lattice\Ui\Enums\Variant;

trait QueuesEffects
{
    abstract public function effect(Effect $effect): static;

    public function toast(string|Translatable|Toast $message, Variant $variant = Variant::Success): static
    {
        return $this->effect($message instanceof Toast ? $message : Toast::make($message, $variant));
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
        return $this->effect(new ReloadComponent($component));
    }

    public function reloadPage(bool $full = false): static
    {
        return $this->effect(new ReloadPage($full));
    }

    public function openModal(string $modal): static
    {
        return $this->effect(new OpenModal($modal));
    }

    public function closeModal(?string $modal = null): static
    {
        return $this->effect(new CloseModal($modal));
    }

    public function resetForm(?string $form = null): static
    {
        return $this->effect(new ResetForm($form));
    }

    public function localeChange(string $locale): static
    {
        return $this->effect(new LocaleChange($locale));
    }

    public function download(string $url): static
    {
        return $this->effect(new Download($url));
    }

    public function toggleSidebar(?string $target = null): static
    {
        return $this->effect(new ToggleSidebar($target));
    }
}
