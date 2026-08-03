<?php
declare(strict_types=1);

use Lattice\Lattice\Core\PageSchema;
use Workbench\App\Pages\Components\CodeBlocksPage;

test('the workbench code blocks page renders JSON and PHP examples', function (): void {
    $schema = wire((new CodeBlocksPage)->render(PageSchema::make())->renderable());

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
            'wrap' => false,
        ],
    ])->and($schema[0]['schema'][4])->toMatchArray([
        'type' => 'code-block',
        'key' => 'code-block-php',
        'props' => [
            'code' => <<<'PHP'
<?php

CodeBlock::make('echo "Hello, Lattice!";')
    ->language(CodeBlockLanguage::Php)
    ->copyable()
    ->wrap();
PHP,
            'language' => 'php',
            'copyable' => true,
            'wrap' => true,
        ],
    ]);
});
