<?php
declare(strict_types=1);

it('copies a copyable text input value via the copy affix', function (): void {
    $page = $this->visitAsWorkbenchUser('/form/fields/text?type=copyable');
    stubSuccessfulClipboard($page);

    $page
        ->click('@referral_code-copy')
        ->assertSee('Copied')
        ->assertNoSmoke();
});

it('opens a field tooltip revealing a link', function (): void {
    $this->visitAsWorkbenchUser('/form/fields/text')
        ->assertNoSmoke()
        ->assertDontSee('the form guide')
        ->click('[aria-label="More information"]')
        ->assertSee('the form guide')
        ->assertPresent('a[href="/form/fields/text"]')
        ->assertNoJavaScriptErrors();
});
