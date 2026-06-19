<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum FieldType: string
{
    private const string Prefix = 'field.';

    case Builder = 'field.builder';
    case Checkbox = 'field.checkbox';
    case Choice = 'field.choice';
    case DateInput = 'field.date-input';
    case DateTimeInput = 'field.date-time-input';
    case FileUpload = 'field.file-upload';
    case HiddenInput = 'field.hidden-input';
    case NumberInput = 'field.number-input';
    case Otp = 'field.otp';
    case PasswordInput = 'field.password-input';
    case Repeater = 'field.repeater';
    case RichEditor = 'field.rich-editor';
    case Select = 'field.select';
    case Textarea = 'field.textarea';
    case TextInput = 'field.text-input';
    case TimeInput = 'field.time-input';
    case Toggle = 'field.toggle';

    public static function wireType(self|string $type): string
    {
        if ($type instanceof self) {
            return $type->value;
        }

        return str_starts_with($type, self::Prefix) ? $type : self::Prefix.$type;
    }

    public static function localType(self|string $type): string
    {
        $value = $type instanceof self ? $type->value : $type;

        return str_starts_with($value, self::Prefix) ? substr($value, strlen(self::Prefix)) : $value;
    }
}
