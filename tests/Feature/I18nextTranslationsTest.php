<?php

declare(strict_types=1);

use function Pest\Laravel\getJson;

it('serves the lattice namespace from the workbench backend as nested i18next JSON', function () {
    getJson('/locales/de/lattice.json')
        ->assertOk()
        ->assertJsonPath('editor.bold', 'Fett')
        ->assertJsonPath('editor.heading-1', 'Überschrift 1')
        ->assertJsonPath('pagination.next', 'Weiter')
        ->assertJsonPath('operators.eq', 'ist gleich')
        ->assertJsonPath('a11y.selectRow', 'Zeile {{key}} auswählen')
        ->assertJsonPath('bulk.selected', '{{count}} ausgewählt');
});
