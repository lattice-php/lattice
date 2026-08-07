<?php
declare(strict_types=1);

use Carbon\CarbonImmutable;
use Lattice\Calendar\Components\Timeline;
use Lattice\Calendar\Entry;
use Workbench\App\Timelines\DeniedTimeline;
use Workbench\App\Timelines\ProjectPlanTimeline;

it('builds an interactive timeline from a definition', function (): void {
    $this->travelTo(CarbonImmutable::parse('2026-08-13 09:00:00'));
    $today = CarbonImmutable::today();

    $node = wire(Timeline::use(ProjectPlanTimeline::class)->from($today)->days(10));

    expect($node['type'])->toBe('timeline')
        ->and($node['props']['endpoint'])->toBe('/lattice/timelines/project-plan')
        ->and($node['props']['ref'])->toBeString()
        ->and($node['props']['from'])->toBe($today->format('Y-m-d'))
        ->and($node['props']['days'])->toBe(10)
        ->and(array_column($node['props']['groups'], 'key'))->toBe(['projects', 'employees'])
        ->and($node['props']['groups'][0]['resources'])->toBe([
            ['id' => 'website-relaunch', 'label' => 'Website Relaunch'],
            ['id' => 'mobile-app', 'label' => 'Mobile App'],
        ])
        ->and(array_column($node['props']['events'], 'id'))->toContain('website-kickoff', 'mobile-planning', 'anna-website', 'ben-mobile');
});

it('defaults from to the start of last week when not set', function (): void {
    $this->travelTo(CarbonImmutable::parse('2026-08-13 09:00:00'));

    $node = wire(Timeline::use(ProjectPlanTimeline::class));

    expect($node['props']['from'])->toBe('2026-08-03');
});

it('does not serialize events outside the requested window', function (): void {
    $this->travelTo(CarbonImmutable::parse('2026-08-13 09:00:00'));
    $today = CarbonImmutable::today();

    $node = wire(Timeline::use(ProjectPlanTimeline::class)->from($today->addDays(30))->days(5));

    expect($node['props']['events'])->toBe([]);
});

it('rejects a non-positive number of days', function (int $days): void {
    Timeline::use(ProjectPlanTimeline::class)->days($days);
})->with([0, -1])->throws(InvalidArgumentException::class);

it('throws when an entry end is not after its start', function (): void {
    Entry::make('bad', 'resource', '2026-08-10', '2026-08-10');
})->throws(InvalidArgumentException::class);

it('throws when an entry end is before its start', function (): void {
    Entry::make('bad', 'resource', '2026-08-10', '2026-08-09');
})->throws(InvalidArgumentException::class);

it('serializes an entry color', function (): void {
    $entry = Entry::make('e1', 'r1', '2026-08-01', '2026-08-02')->color('blue')->jsonSerialize();

    expect($entry['color'])->toBe(['kind' => 'named', 'value' => 'blue', 'dark' => null]);
});

it('omits color when unset', function (): void {
    $entry = Entry::make('e1', 'r1', '2026-08-01', '2026-08-02')->jsonSerialize();

    expect($entry)->not->toHaveKey('color');
});

it('hides the timeline when the definition denies authorization', function (): void {
    expect(Timeline::use(DeniedTimeline::class)->shouldRender())->toBeFalse();
});

it('keeps interactive props inert on plain timelines', function (): void {
    $node = wire(Timeline::make());

    expect($node['props']['ref'])->toBeNull()
        ->and($node['props']['endpoint'])->toBeNull()
        ->and($node['props']['groups'])->toBe([])
        ->and($node['props']['events'])->toBe([]);
});
