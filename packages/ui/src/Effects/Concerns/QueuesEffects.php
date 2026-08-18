<?php
declare(strict_types=1);

namespace Lattice\Ui\Effects\Concerns;

use Lattice\Ui\Components\Modal;
use Lattice\Ui\Effects\Builtin\Callout;
use Lattice\Ui\Effects\Builtin\CloseModal;
use Lattice\Ui\Effects\Builtin\Download;
use Lattice\Ui\Effects\Builtin\LocaleChange;
use Lattice\Ui\Effects\Builtin\OpenModal;
use Lattice\Ui\Effects\Builtin\ReloadComponent;
use Lattice\Ui\Effects\Builtin\ReloadPage;
use Lattice\Ui\Effects\Builtin\ResetForm;
use Lattice\Ui\Effects\Builtin\Toast;
use Lattice\Ui\Effects\Builtin\ToggleSidebar;
use Lattice\Ui\Effects\Effect;
use Lattice\Ui\Enums\Variant;
use Lattice\Ui\I18n\Values\Translatable;

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

    public function openModal(Modal $modal): static
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
