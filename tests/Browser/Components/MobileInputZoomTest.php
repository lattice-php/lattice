<?php
declare(strict_types=1);

use Workbench\App\Models\Product;

it('keeps text-entry controls at 16px below md so iOS Safari does not auto-zoom', function (
    string $url,
    string $selector,
    float $desktopFontSize,
): void {
    if ($url === '/products') {
        Product::factory()->create();
    }

    $page = $this->visitAsWorkbenchUser($url)->resize(390, 844);
    assertPresentEventually($page, $selector);

    $fontSize = fn (): float => (float) $page->script(
        "() => parseFloat(getComputedStyle(document.querySelector('{$selector}')).fontSize)",
    );

    expect($fontSize())->toBeGreaterThanOrEqual(16.0);

    $page->resize(1280, 800);

    expect($fontSize())->toBe($desktopFontSize);
})->with([
    'text input' => ['/form/fields/text', '[data-slot="input"]', 14.0],
    'textarea' => ['/form/fields/textarea', '[data-slot="textarea"]', 14.0],
    'table page-size select' => ['/products', '[data-slot="native-select"]', 13.0],
]);
