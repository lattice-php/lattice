<?php
declare(strict_types=1);

namespace Lattice\Blocks;

use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Lattice\Form\FieldValidator;

/**
 * Validates a block tree the way a form validates its fields, plus the slot
 * rules only a tree has. Errors come back per block id so the editor can pin
 * them to the block and field they belong to.
 */
final readonly class BlockValidator
{
    public const string TYPE_ERROR = '_type';

    public function __construct(
        private BlockRegistry $blocks,
        private FieldValidator $fields,
    ) {}

    /**
     * Field-level errors for every known block; unknown or disallowed types
     * are reported only when `$strict` (publishing), since a draft may keep a
     * block whose definition is temporarily gone.
     *
     * @param  list<string>|null  $allowedTypes
     * @return array<string, array<string, list<string>>>
     */
    public function validate(BlockDocument $document, ?array $allowedTypes = null, bool $strict = false): array
    {
        $errors = [];

        foreach ($document->blocks as $block) {
            $errors = $this->mergeErrors($errors, $this->validateNode($block, null, null, $allowedTypes, $strict));
        }

        return $errors;
    }

    /**
     * @return array<string, list<string>>
     */
    public function validateBlock(BlockNode $node): array
    {
        $definition = $this->blocks->find($node->type);

        if (! $definition instanceof BlockDefinition) {
            return [self::TYPE_ERROR => [__('blocks::blocks.errors.unknown-type', ['type' => $node->type])]];
        }

        try {
            $this->fields->validate($definition->fields(), Request::create('/', 'POST', $node->data));
        } catch (ValidationException $exception) {
            return $this->messages($exception->errors());
        }

        return [];
    }

    /**
     * @param  list<string>|null  $allowedTypes
     * @return array<string, array<string, list<string>>>
     */
    private function validateNode(BlockNode $node, ?SlotData $slot, ?string $parentId, ?array $allowedTypes, bool $strict): array
    {
        $definition = $this->blocks->find($node->type);
        $disallowed = $allowedTypes !== null && ! in_array($node->type, $allowedTypes, true);
        $errors = [];

        if (! $definition instanceof BlockDefinition || $disallowed) {
            return $strict
                ? [$node->id => [self::TYPE_ERROR => [__('blocks::blocks.errors.unknown-type', ['type' => $node->type])]]]
                : [];
        }

        if ($slot instanceof SlotData && $parentId !== null && ! $slot->accepts($node->type)) {
            $errors[$parentId]["_slots.{$slot->name}"][] = __('blocks::blocks.errors.slot-rejects', ['type' => $definition->label(), 'slot' => $slot->label]);
        }

        $fieldErrors = $this->validateBlock($node);

        if ($fieldErrors !== []) {
            $errors[$node->id] = $fieldErrors;
        }

        $slots = $this->blocks->slotsFor($definition, $node->data);

        foreach ($node->slots as $name => $children) {
            $childSlot = $slots[$name] ?? null;

            if ($childSlot === null) {
                if ($strict && $children !== []) {
                    $errors[$node->id]["_slots.{$name}"][] = __('blocks::blocks.errors.unknown-slot', ['slot' => $name]);
                }

                continue;
            }

            $count = count($children);

            if ($childSlot->min !== null && $count < $childSlot->min) {
                $errors[$node->id]["_slots.{$name}"][] = __('blocks::blocks.errors.slot-min', ['slot' => $childSlot->label, 'min' => $childSlot->min]);
            }

            if ($childSlot->max !== null && $count > $childSlot->max) {
                $errors[$node->id]["_slots.{$name}"][] = __('blocks::blocks.errors.slot-max', ['slot' => $childSlot->label, 'max' => $childSlot->max]);
            }

            foreach ($children as $child) {
                $errors = $this->mergeErrors($errors, $this->validateNode($child, $childSlot, $node->id, $allowedTypes, $strict));
            }
        }

        return $errors;
    }

    /**
     * @param  array<string, array<string, list<string>>>  $into
     * @param  array<string, array<string, list<string>>>  $errors
     * @return array<string, array<string, list<string>>>
     */
    private function mergeErrors(array $into, array $errors): array
    {
        foreach ($errors as $blockId => $fields) {
            foreach ($fields as $field => $messages) {
                $into[$blockId][$field] = [...$into[$blockId][$field] ?? [], ...$messages];
            }
        }

        return $into;
    }

    /**
     * @param  array<string, mixed>  $errors
     * @return array<string, list<string>>
     */
    private function messages(array $errors): array
    {
        $messages = [];

        foreach ($errors as $field => $fieldMessages) {
            $messages[$field] = array_values(array_filter(is_array($fieldMessages) ? $fieldMessages : [$fieldMessages], is_string(...)));
        }

        return $messages;
    }
}
