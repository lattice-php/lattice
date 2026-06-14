<?php
declare(strict_types=1);

namespace Lattice\Lattice\Actions\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum EffectType: string
{
    case Toast = 'toast';
    case Callout = 'callout';
    case ReloadComponent = 'reloadComponent';
    case ReloadPage = 'reloadPage';
    case Redirect = 'redirect';
    case Download = 'download';
    case OpenModal = 'openModal';
    case CloseModal = 'closeModal';
    case ResetForm = 'resetForm';
    case LocaleChange = 'localeChange';
}
