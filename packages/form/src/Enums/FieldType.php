<?php
declare(strict_types=1);

namespace Lattice\Form\Enums;

use Lattice\Core\Enums\Concerns\HasPrefixedWireType;

enum FieldType: string
{
    use HasPrefixedWireType;

    private const string Prefix = 'field.';

    case Builder = 'field.builder';
    case Checkbox = 'field.checkbox';
    case Choice = 'field.choice';
    case ColorPicker = 'field.color-picker';
    case DateInput = 'field.date-input';
    case DateTimeInput = 'field.date-time-input';
    case FileUpload = 'field.file-upload';
    case HiddenInput = 'field.hidden-input';
    case NumberInput = 'field.number-input';
    case Otp = 'field.otp';
    case PasswordInput = 'field.password-input';
    case PatternInput = 'field.pattern-input';
    case Repeater = 'field.repeater';
    case RichEditor = 'field.rich-editor';
    case Select = 'field.select';
    case Textarea = 'field.textarea';
    case TextInput = 'field.text-input';
    case TimeInput = 'field.time-input';
    case Toggle = 'field.toggle';
}
