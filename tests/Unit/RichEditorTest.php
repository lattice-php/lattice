<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\Components\RichEditor;

describe('docs fixtures', function (): void {
    it('dumps the rich editor example', function (): void {
        dumpFixture('rich-editor.basic', [
            RichEditor::make('article', 'Article')->placeholder('Write your article…'),
        ]);

        expect('docs/fixtures/rich-editor.basic.json')->toBeReadableFile();
    });
});
