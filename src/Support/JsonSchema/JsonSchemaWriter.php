<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\JsonSchema;

use stdClass;

/**
 * Deterministic serialization of the schema document: two-space pretty JSON,
 * unescaped slashes, trailing newline. Empty PHP arrays are JSON objects here —
 * the document never contains a legitimately empty JSON array, while the empty
 * schema `{}` (PHP `mixed`) and propless `properties` maps are common.
 */
final readonly class JsonSchemaWriter
{
    /**
     * @param  array<string, mixed>  $document
     */
    public function write(array $document): string
    {
        $json = json_encode(
            $this->objectified($document),
            JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR,
        );

        $json = preg_replace_callback(
            '/^ +/m',
            static fn (array $matches): string => str_repeat(' ', intdiv(strlen($matches[0]), 2)),
            $json,
        );

        return $json."\n";
    }

    private function objectified(mixed $value): mixed
    {
        if (! is_array($value)) {
            return $value;
        }

        if ($value === []) {
            return new stdClass;
        }

        return array_map($this->objectified(...), $value);
    }
}
