<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Actions;

enum EffectType: string
{
    case Toast = 'toast';
    case ReloadComponent = 'reloadComponent';
    case ReloadPage = 'reloadPage';
    case Redirect = 'redirect';
    case Download = 'download';
    case OpenModal = 'openModal';
    case CloseModal = 'closeModal';
    case ResetForm = 'resetForm';
}
