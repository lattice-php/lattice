<?php
declare(strict_types=1);

use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Actions\Components\BulkAction;
use Lattice\Lattice\Core\Color;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Forms\Components\Choice;
use Lattice\Lattice\Forms\Components\Field;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\Conditions\FieldConditions;
use Lattice\Lattice\Http\PagePayload;
use Lattice\Lattice\Support\JsonSchema\JsonSchemaContext;
use Lattice\Lattice\Support\JsonSchema\PropertySchemaMapper;
use Lattice\Lattice\Tables\Columns\BadgeColumn;
use Lattice\Lattice\Ui\Components\Button;
use Lattice\Lattice\Ui\Components\Component;
use Lattice\Lattice\Ui\Enums\ButtonType;

function mapperContext(): JsonSchemaContext
{
    return new JsonSchemaContext(
        defNames: [
            ButtonType::class => 'ButtonType',
            FieldConditions::class => 'FieldConditions',
            Option::class => 'Option',
            Color::class => 'Color',
        ],
        nodeDefs: [
            'component' => [Action::class => 'action', BulkAction::class => 'action.bulk'],
        ],
        markers: [Component::class => ['component', 'Node']],
    );
}

/**
 * @param  class-string  $class
 * @return array<string, mixed>
 */
function mapProperty(string $class, string $property): array
{
    return new PropertySchemaMapper(mapperContext())->map(new ReflectionProperty($class, $property));
}

it('maps a native nullable scalar to a nullable type array', function (): void {
    expect(mapProperty(Button::class, 'label'))->toBe(['type' => ['string', 'null']]);
});

it('maps a backed enum to a def reference', function (): void {
    expect(mapProperty(Button::class, 'buttonType'))->toBe(['$ref' => '#/$defs/ButtonType']);
});

it('maps a trait-declared docblock list to an array of refs', function (): void {
    expect(mapProperty(Choice::class, 'options'))->toBe([
        'type' => 'array',
        'items' => ['$ref' => '#/$defs/Option'],
    ]);
});

it('maps a nullable value object to an anyOf with null last', function (): void {
    expect(mapProperty(Field::class, 'conditions'))->toBe([
        'anyOf' => [
            ['$ref' => '#/$defs/FieldConditions'],
            ['type' => 'null'],
        ],
    ]);
});

it('maps a wire map to additionalProperties', function (): void {
    expect(mapProperty(BadgeColumn::class, 'colors'))->toBe([
        'anyOf' => [
            [
                'type' => 'object',
                'additionalProperties' => ['$ref' => '#/$defs/Color'],
                'x-lattice' => ['keys' => 'integer|string'],
            ],
            ['type' => 'null'],
        ],
    ]);
});

it('maps a concrete node class to a union of its node defs', function (): void {
    expect(mapProperty(Button::class, 'action'))->toBe([
        'anyOf' => [
            ['$ref' => '#/$defs/node:action'],
            ['$ref' => '#/$defs/node:action.bulk'],
            ['type' => 'null'],
        ],
    ]);
});

it('maps mixed to the empty schema', function (): void {
    expect(mapProperty(TextInput::class, 'value'))->toBe([]);
});

it('maps an int-keyed collection to a JSON array', function (): void {
    expect(mapProperty(PagePayload::class, 'schema'))->toBe([
        'type' => 'array',
        'items' => ['$ref' => '#/$defs/Node'],
    ]);
});
