<?php
declare(strict_types=1);

it('applies the registered workbench theme with derived interaction states', function (): void {
    $page = $this->visitAsWorkbenchUser('/');

    $resolved = $page->script(<<<'JS'
        () => {
            const resolve = (value) => {
                const probe = document.createElement('div');
                probe.style.backgroundColor = value;
                document.body.appendChild(probe);
                const color = getComputedStyle(probe).backgroundColor;
                probe.remove();
                return color;
            };

            return {
                primary: resolve('var(--lt-primary)'),
                hover: resolve('var(--lt-primary-hover)'),
                derivedFromThemedPrimary: resolve('oklch(from #4f46e5 calc(l - 0.05) c h)'),
            };
        }
    JS);

    // Swatch::Indigo (#4f46e5) from the workbench provider, and a hover the
    // stylesheet derived from that themed base rather than the default teal.
    expect($resolved['primary'])->toBe('rgb(79, 70, 229)')
        ->and($resolved['hover'])->toBe($resolved['derivedFromThemedPrimary'])
        ->and($resolved['hover'])->not->toBe($resolved['primary']);

    $page->assertNoSmoke();
});
