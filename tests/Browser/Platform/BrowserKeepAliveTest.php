<?php
declare(strict_types=1);

it('keeps the browser connections to the test server alive for an hour', function (): void {
    $page = $this->visitAsWorkbenchUser('/');

    expect($page->script("fetch('/').then((response) => response.headers.get('keep-alive'))"))->toBe('timeout=3600');
});
