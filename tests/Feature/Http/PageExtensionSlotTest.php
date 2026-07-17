<?php

declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Http\Page;
use Lattice\Lattice\Ui\Components\Tab;
use Lattice\Lattice\Ui\Components\Tabs;
use Lattice\Lattice\Ui\Slot;

final readonly class PageExtensionProject
{
    public function __construct(public string $slug) {}
}

final class PageExtensionSlotPage extends Page
{
    public function __construct(private readonly PageExtensionProject $project) {}

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Tabs::make('project-settings-tabs')
                ->defaultValue('general')
                ->schema([
                    Slot::make('project.settings.tabs')->context([
                        'project' => $this->project,
                    ]),
                ]),
        ]);
    }
}

it('expands page slots before tab inspection and visibility filtering', function (): void {
    $project = new PageExtensionProject('lattice');

    Lattice::extend(
        'project.settings.tabs',
        fn (PageExtensionProject $project): Tab => Tab::make('api', "API for {$project->slug}"),
        priority: 20,
    );
    Lattice::extend(
        'project.settings.tabs',
        fn (): Tab => Tab::make('general', 'General'),
        priority: 10,
    );
    Lattice::extend(
        'project.settings.tabs',
        fn (): Tab => Tab::make('hidden', 'Hidden')->visible(false),
        priority: 15,
    );

    $page = new PageExtensionSlotPage($project);
    $payload = wire($page->toArray($page->render(PageSchema::make()), new Request));
    $tabs = $payload['schema'][0];

    expect($tabs['type'])->toBe('tabs')
        ->and($tabs['props']['activeValue'])->toBe('general')
        ->and(array_column(array_column($tabs['schema'], 'props'), 'value'))->toBe(['general', 'api'])
        ->and($tabs['schema'][1]['props']['label'])->toBe('API for lattice')
        ->and(wireJson($payload))->not->toContain('"type":"slot"');
});
