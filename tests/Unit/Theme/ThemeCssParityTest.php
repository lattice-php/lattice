<?php
declare(strict_types=1);

use Lattice\Theme\Theme;

it('defines every builder colour token in both stylesheet scopes', function (): void {
    $css = file_get_contents(dirname(__DIR__, 3).'/packages/ui/resources/css/lattice.css');

    if ($css === false) {
        throw new RuntimeException('Unable to read packages/ui/resources/css/lattice.css.');
    }

    [$light, $dark] = explode('[data-theme="dark"]', $css, 2);

    foreach (Theme::COLOR_TOKENS as $token) {
        expect($light)->toContain("{$token}:");
        expect($dark)->toContain("{$token}:");
    }
});
