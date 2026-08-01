<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\RichEditor;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Decodes a submitted rich-editor document and runs each active extension's
 * validateDocument() over it, failing with every message returned.
 */
final class ValidatesEditorDocument implements ValidationRule
{
    /**
     * @param  list<EditorExtension>  $extensions
     */
    public function __construct(private array $extensions) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || $value === '') {
            return;
        }

        $document = json_decode($value, true);

        if (! is_array($document)) {
            return;
        }

        foreach ($this->extensions as $extension) {
            foreach ($extension->validateDocument($document) as $message) {
                $fail($message);
            }
        }
    }
}
