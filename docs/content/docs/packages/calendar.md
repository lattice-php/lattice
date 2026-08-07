---
title: Calendar
description: Read-only resource-planning timeline (Plantafel) with zoom, lazy window fetching, collapsible groups, and overlap lanes.
---

The calendar package renders a resource-planning timeline — a "Plantafel" board of resource rows
(projects, employees, rooms, anything with an ID) against a day-granular date axis, with entries
drawn as bars. It ships a sticky month/calendar-week/day header, zoom, prev/next/today navigation
with lazy window fetching, collapsible resource groups, and automatic lane-stacking for
overlapping entries.

:::caution
v1 is **read-only**. There is no drag-to-move, resize, or click-to-create yet — the board only
displays what a `TimelineDefinition` returns.
:::

## Installation

```bash
composer require lattice-php/calendar
```

That is the whole integration: the package ships its React renderer as source, and the
`lattice()` Vite plugin compiles it into your app's bundle via `virtual:lattice/plugins`
(see [Component packages](/extending/component-packages/)). The PHP classes are picked up by
Lattice's discovery and TypeScript generation automatically.
[No-build apps](/introduction/no-build/) use the precompiled module the package also ships:
run `php artisan lattice:assets` after installation.

:::note
There is no npm package — Composer is the only install.
:::

## Usage

Register a definition with `#[AsTimeline('key')]`: `groups()` returns the resource rows, grouped
and labeled, and `events()` returns the entries for a requested `[$from, $until)` window (`$until`
exclusive):

```php
use Carbon\CarbonImmutable;
use Lattice\Calendar\AsTimeline;
use Lattice\Calendar\Entry;
use Lattice\Calendar\ResourceGroup;
use Lattice\Calendar\TimelineDefinition;

#[AsTimeline('project-plan')]
final class ProjectPlanTimeline extends TimelineDefinition
{
    public function groups(): array
    {
        return [
            ResourceGroup::make('projects', 'Projects')->resources([
                ['id' => 'website-relaunch', 'label' => 'Website Relaunch'],
                ['id' => 'mobile-app', 'label' => 'Mobile App'],
            ]),
            ResourceGroup::make('employees', 'Employees')->resources(
                fn (): array => Employee::query()->select('id', 'name as label')->get()->toArray(),
            ),
        ];
    }

    public function events(CarbonImmutable $from, CarbonImmutable $until): iterable
    {
        return Assignment::query()
            ->where('starts_at', '<', $until)
            ->where('ends_at', '>', $from)
            ->get()
            ->map(fn (Assignment $assignment): Entry => Entry::make(
                (string) $assignment->id,
                (string) $assignment->resource_id,
                $assignment->starts_at,
                $assignment->ends_at,
            )->label($assignment->title)->color($assignment->color));
    }
}
```

`ResourceGroup::make($key, $label)->resources()` takes either an inline list of
`['id' => ..., 'label' => ...]` rows or a closure returning the same shape — evaluated once per
render/fetch, so an Eloquent-backed group can query at read time.

Render it with `Timeline::use()`:

```php
use Lattice\Calendar\Components\Timeline;

Timeline::use(ProjectPlanTimeline::class)
    ->from('2026-08-01')
    ->days(90);
```

Without `->from()`, the board opens on the start of the current week minus one week, so "today"
sits inside the initial page rather than at its edge. `->days()` sets the initially rendered
window (default 90) — navigating and zooming fetch more as needed, see below.

### Entries

`Entry::make($id, $resourceId, $start, $end)` is day-granular and **`$end` is exclusive** — a
one-day entry has `$end` one day after `$start`, same convention as the `events()` window. Dates
accept a `DateTimeInterface` or a `Y-m-d` string. `->label()` sets the bar text and
`->color()` accepts any Lattice color (see [Enums reference](/advanced/enums/)); entries left
uncolored render in the theme's primary tone.

Entries on the same resource that overlap in time are not stacked by the server — the client
assigns them to lanes automatically and grows the row to fit, so `events()` can simply return
whatever overlaps.

## Navigation, zoom, and lazy loading

The header is sticky in three rows — month, calendar week, and day — with weekend columns
striped and a marker line for today. Toolbar controls: `‹`/`›` step the visible window by a week,
**Today** recenters on it, and `−`/`+` zoom the day column width (10–64px) without changing how
many days are loaded. Resource groups collapse independently via their chevron.

Navigating past the initially rendered `days` window fetches the missing range from the
definition's endpoint, merging it into what is already loaded client-side rather than re-fetching
already-seen days — the same signed-reference pattern Lattice tables and trees use. The package
registers its own route (there is no core routes seam), following Lattice's group conventions:
`config('lattice.timelines.middleware', ['web', 'auth'])` and
`config('lattice.timelines.endpoint', 'lattice/timelines/{timeline}')`.

`GET lattice/timelines/{timeline}?from=Y-m-d&to=Y-m-d` (`to` exclusive) re-resolves the
definition from its sealed reference and calls `events($from, $to)` again — `authorize()` on the
definition gates both the initial render and every window fetch, mirroring
[trees](/packages/tree/#lazy-loading) and the [signing machinery](/core/authorization/) behind
them.

## Translations

The component's strings ship with inline English defaults. With
[laravel-i18next](https://github.com/bambamboole/laravel-i18next) enabled, the plugin's `calendar`
namespace is loaded automatically and serves the bundled `en`/`de` translations (override them
like any Laravel package translation — see [Internationalization](/core/i18n/)).
