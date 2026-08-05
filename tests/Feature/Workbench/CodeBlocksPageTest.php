<?php
declare(strict_types=1);

use Lattice\Ui\PageSchema;
use Workbench\App\Pages\Components\CodeBlocksPage;

test('the workbench code blocks page renders JSON and PHP examples', function (): void {
    $schema = wire((new CodeBlocksPage)->render(PageSchema::make())->renderable());
    $phpExample = $schema[0]['schema'][4];

    expect($schema[0]['schema'][2])->toMatchArray([
        'type' => 'code-block',
        'key' => 'code-block-json',
        'props' => [
            'code' => <<<'JSON'
{
    "name": "Lattice",
    "language": "PHP"
}
JSON,
            'language' => 'json',
            'copyable' => false,
            'lineNumbers' => false,
            'maxHeight' => null,
            'wrap' => false,
        ],
    ])->and($phpExample['type'])->toBe('code-block')
        ->and($phpExample['key'])->toBe('code-block-php')
        ->and($phpExample['props']['language'])->toBe('php')
        ->and($phpExample['props']['copyable'])->toBeTrue()
        ->and($phpExample['props']['lineNumbers'])->toBeTrue()
        ->and($phpExample['props']['maxHeight'])->toBe(320)
        ->and($phpExample['props']['wrap'])->toBeTrue()
        ->and($phpExample['props']['code'])->toContain(
            'final class CodeBlocksPage extends WorkbenchPage',
            '->lineNumbers()',
            '->maxHeight(320)',
        );
});
