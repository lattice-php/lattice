<?php
declare(strict_types=1);

it('applies breakpoint columns and child spans in a real grid', function (): void {
    $page = $this->visitAsWorkbenchUser('/components/containers');

    $grid = $page->script(<<<'JS'
        () => {
            const grid = document.querySelector('[data-lattice-component="containers-grid"]');
            const items = [...grid.querySelectorAll(':scope > [data-slot=grid-item]')].map(
                (item) => getComputedStyle(item),
            );

            return {
                tracks: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
                wide: items[0].gridColumnStart,
                narrow: items[1].gridColumnStart,
                full: `${items[2].gridColumnStart} / ${items[2].gridColumnEnd}`,
            };
        }
    JS);

    expect($grid['tracks'])->toBe(3)
        ->and($grid['wide'])->toBe('span 2')
        ->and($grid['narrow'])->toBe('auto')
        ->and($grid['full'])->toBe('1 / -1');

    $page->assertNoSmoke();
});
