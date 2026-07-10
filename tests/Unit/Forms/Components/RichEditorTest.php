<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\Components\RichEditor;
use Lattice\Lattice\Support\Wire;

describe('docs fixtures', function (): void {
    it('matches the rich editor example fixture', function (): void {
        assertFixtureMatches('rich-editor.basic', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            RichEditor::make('article', 'Article')->placeholder('Write your article…'),
        ]))));
    });
});
