<?php

declare(strict_types=1);

use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Lattice\Core\Enums\PageContainer;
use Lattice\Lattice\Core\Enums\PageLayout;
use Lattice\Lattice\Core\PageMetadataResolver;
use Lattice\Lattice\Http\Page as BasePage;
use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredDemoPage;

#[AsPage(layout: PageLayout::App, container: PageContainer::Default)]
abstract class ResolverBasePage extends BasePage {}

#[AsPage(route: '/resolver', name: 'resolver.index')]
final class ResolverPage extends ResolverBasePage {}

test('resolver memoizes reflected metadata by page class', function (): void {
    $resolver = app(PageMetadataResolver::class);

    $first = $resolver->for(ResolverPage::class);
    $second = $resolver->for(new ResolverPage);

    expect($second)->toBe($first)
        ->and($first->route)->toBe('/resolver')
        ->and($first->layout)->toBe(PageLayout::App);
});

test('resolver memoizes metadata loaded from the discovery manifest', function (): void {
    config(['lattice.discover' => [
        __DIR__.'/../Fixtures/Discovery',
    ]]);

    $manifest = app(DiscoveryManifest::class);
    $manifest->cache();
    app()->forgetInstance(PageMetadataResolver::class);

    try {
        $resolver = app(PageMetadataResolver::class);

        $first = $resolver->for(DiscoveredDemoPage::class);
        $second = $resolver->for(DiscoveredDemoPage::class);

        expect($second)->toBe($first)
            ->and($first->name)->toBe('discovered.demo');
    } finally {
        $manifest->clear();
    }
});
