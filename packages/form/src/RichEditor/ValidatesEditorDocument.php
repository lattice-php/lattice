<?php
declare(strict_types=1);

namespace Lattice\Form\RichEditor;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Lattice\Form\RichContent;

/**
 * Decodes a submitted rich-editor document and runs each active extension's
 * validateDocument() over it, failing with every message returned.
 */
final readonly class ValidatesEditorDocument implements ValidationRule
{
    /**
     * @param  list<EditorExtension>  $extensions
     */
    public function __construct(private array $extensions) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $document = RichContent::decodeDocument($value);

        if ($document === null) {
            return;
        }

        foreach ($this->extensions as $extension) {
            foreach ($extension->validateDocument($document) as $message) {
                $fail($message);
            }
        }
    }
}
