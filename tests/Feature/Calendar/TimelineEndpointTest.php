<?php
declare(strict_types=1);

use Carbon\CarbonImmutable;
use Lattice\Calendar\Components\Timeline;
use Lattice\Core\Contracts\SignsComponentReferences;
use Workbench\App\Timelines\ProjectPlanTimeline;

use function Pest\Laravel\getJson;
use function Pest\Laravel\patchJson;

it('returns events for the requested window', function (): void {
    $this->travelTo(CarbonImmutable::parse('2026-08-13 09:00:00'));
    $today = CarbonImmutable::today();

    $timeline = $this->sealTimeline(fn (): Timeline => Timeline::use(ProjectPlanTimeline::class));

    $response = getJson(
        $timeline['props']['endpoint'].'?from='.$today->format('Y-m-d').'&to='.$today->addDays(3)->format('Y-m-d'),
        ['X-Lattice-Ref' => $timeline['props']['ref']],
    );

    $response->assertOk();

    expect(array_column($response->json('events'), 'id'))->toContain('website-team');
});

it('atomically reschedules one assignment without adding another resource', function (): void {
    $this->travelTo(CarbonImmutable::parse('2026-08-13 09:00:00'));
    $today = CarbonImmutable::today();
    $timeline = $this->sealTimeline(fn (): Timeline => Timeline::use(ProjectPlanTimeline::class));

    patchJson($timeline['props']['endpoint'], [
        'id' => 'website-anna',
        'resourceId' => 'ben',
        'start' => $today->addDay()->format('Y-m-d'),
        'end' => $today->addDays(6)->format('Y-m-d'),
    ], ['X-Lattice-Ref' => $timeline['props']['ref']])
        ->assertOk()
        ->assertJsonPath('event.id', 'website-anna')
        ->assertJsonPath('event.resourceId', 'ben')
        ->assertJsonPath('event.start', $today->addDay()->format('Y-m-d'))
        ->assertJsonPath('event.end', $today->addDays(6)->format('Y-m-d'));

    $response = getJson(
        $timeline['props']['endpoint'].'?from='.$today->format('Y-m-d').'&to='.$today->addDays(7)->format('Y-m-d'),
        ['X-Lattice-Ref' => $timeline['props']['ref']],
    );

    $response
        ->assertJsonFragment(['id' => 'website-team', 'resourceId' => 'team-website'])
        ->assertJsonFragment(['id' => 'website-anna', 'resourceId' => 'ben']);
});

it('resizes an assignment without changing its planning resource', function (): void {
    $this->travelTo(CarbonImmutable::parse('2026-08-13 09:00:00'));
    $today = CarbonImmutable::today();
    $timeline = $this->sealTimeline(fn (): Timeline => Timeline::use(ProjectPlanTimeline::class));

    patchJson($timeline['props']['endpoint'], [
        'id' => 'website-anna',
        'resourceId' => 'anna',
        'start' => $today->addDay()->format('Y-m-d'),
        'end' => $today->addDays(5)->format('Y-m-d'),
    ], ['X-Lattice-Ref' => $timeline['props']['ref']])
        ->assertOk()
        ->assertJsonPath('event.resourceId', 'anna')
        ->assertJsonPath('event.start', $today->addDay()->format('Y-m-d'))
        ->assertJsonPath('event.end', $today->addDays(5)->format('Y-m-d'));

    getJson(
        $timeline['props']['endpoint'].'?from='.$today->format('Y-m-d').'&to='.$today->addDays(7)->format('Y-m-d'),
        ['X-Lattice-Ref' => $timeline['props']['ref']],
    )
        ->assertJsonFragment([
            'id' => 'website-anna',
            'resourceId' => 'anna',
            'start' => $today->addDay()->format('Y-m-d'),
            'end' => $today->addDays(5)->format('Y-m-d'),
        ]);
});

it('returns the adapter translated message when a reschedule is rejected', function (): void {
    $this->travelTo(CarbonImmutable::parse('2026-08-13 09:00:00'));
    $today = CarbonImmutable::today();
    $timeline = $this->sealTimeline(fn (): Timeline => Timeline::use(ProjectPlanTimeline::class));

    patchJson($timeline['props']['endpoint'], [
        'id' => 'website-anna',
        'resourceId' => 'missing',
        'start' => $today->format('Y-m-d'),
        'end' => $today->addDays(5)->format('Y-m-d'),
    ], ['X-Lattice-Ref' => $timeline['props']['ref']])
        ->assertUnprocessable()
        ->assertJsonPath('errors.resourceId.0', 'This planning resource is unavailable.');
});

it('rejects a request without a ref', function (): void {
    $timeline = $this->sealTimeline(fn (): Timeline => Timeline::use(ProjectPlanTimeline::class));

    getJson($timeline['props']['endpoint'].'?from=2026-08-01&to=2026-08-10')->assertForbidden();
});

it('rejects a forged ref', function (): void {
    $timeline = $this->sealTimeline(fn (): Timeline => Timeline::use(ProjectPlanTimeline::class));

    getJson(
        $timeline['props']['endpoint'].'?from=2026-08-01&to=2026-08-10',
        ['X-Lattice-Ref' => 'forged'],
    )->assertForbidden();
});

it('rejects an expired ref', function (): void {
    $timeline = $this->sealTimeline(fn (): Timeline => Timeline::use(ProjectPlanTimeline::class));

    $this->travel(config('lattice.security.ref_lifetime', 30) + 1)->minutes();

    getJson(
        $timeline['props']['endpoint'].'?from=2026-08-01&to=2026-08-10',
        ['X-Lattice-Ref' => $timeline['props']['ref']],
    )->assertForbidden();
});

it('rejects a ref sealed for a different timeline', function (): void {
    $timeline = $this->sealTimeline(fn (): Timeline => Timeline::use(ProjectPlanTimeline::class));

    $foreign = app(SignsComponentReferences::class)->seal('timeline', 'denied', []);

    getJson(
        $timeline['props']['endpoint'].'?from=2026-08-01&to=2026-08-10',
        ['X-Lattice-Ref' => $foreign],
    )->assertForbidden();
});

it('returns 404 for a sealed but unregistered timeline key', function (): void {
    $ref = app(SignsComponentReferences::class)->seal('timeline', 'ghost', []);

    getJson('/lattice/timelines/ghost?from=2026-08-01&to=2026-08-10', ['X-Lattice-Ref' => $ref])->assertNotFound();
});

it('denies when the definition rejects authorization', function (): void {
    $ref = app(SignsComponentReferences::class)->seal('timeline', 'denied', []);

    getJson('/lattice/timelines/denied?from=2026-08-01&to=2026-08-10', ['X-Lattice-Ref' => $ref])->assertForbidden();
});

it('rejects a malformed from/to', function (): void {
    $timeline = $this->sealTimeline(fn (): Timeline => Timeline::use(ProjectPlanTimeline::class));

    getJson(
        $timeline['props']['endpoint'].'?from=not-a-date&to=2026-08-10',
        ['X-Lattice-Ref' => $timeline['props']['ref']],
    )->assertStatus(422);
});

it('rejects an invalid calendar date', function (string $date): void {
    $timeline = $this->sealTimeline(fn (): Timeline => Timeline::use(ProjectPlanTimeline::class));

    getJson(
        $timeline['props']['endpoint'].'?from='.$date.'&to=2027-02-01',
        ['X-Lattice-Ref' => $timeline['props']['ref']],
    )->assertStatus(422);
})->with(['2026-02-31', '2026-13-01', '2026-00-10']);

it('rejects a missing from/to', function (): void {
    $timeline = $this->sealTimeline(fn (): Timeline => Timeline::use(ProjectPlanTimeline::class));

    getJson($timeline['props']['endpoint'], ['X-Lattice-Ref' => $timeline['props']['ref']])->assertStatus(422);
});

it('rejects an inverted from/to', function (): void {
    $timeline = $this->sealTimeline(fn (): Timeline => Timeline::use(ProjectPlanTimeline::class));

    getJson(
        $timeline['props']['endpoint'].'?from=2026-08-10&to=2026-08-01',
        ['X-Lattice-Ref' => $timeline['props']['ref']],
    )->assertStatus(422);
});
