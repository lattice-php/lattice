<?php
declare(strict_types=1);

it('renders every demo page without smoke failures', function (): void {
    $this->actingAs(workbenchTestUser());

    visit([
        '/form/fields/text',
        '/form/fields/textarea',
        '/form/fields/number',
        '/form/fields/password',
        '/form/fields/select',
        '/form/fields/choice',
        '/form/fields/boolean',
        '/form/fields/date-time',
        '/form/fields/file-upload',
        '/form/fields/otp',
        '/form/fields/rich-editor',
        '/form/fields/repeater',
        '/form/fields/builder',
        '/form/dependent',
        '/form/validation',
        '/tables/columns/text',
        '/tables/columns/number',
        '/tables/columns/visual',
        '/tables/columns/custom',
        '/tables/filters',
        '/tables/pagination',
        '/tables/actions',
        '/tables/behavior',
        '/components/buttons',
        '/components/tabs',
        '/components/charts',
        '/components/containers',
        '/components/notifications',
        '/components/chat',
    ])->assertNoSmoke();
});
