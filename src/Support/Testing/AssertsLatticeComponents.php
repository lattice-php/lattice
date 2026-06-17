<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\Testing;

use Illuminate\Http\Response;
use Illuminate\Testing\TestResponse;
use Inertia\Testing\AssertableInertia;
use JsonSerializable;
use Lattice\Lattice\Support\Testing\Assertions\ComponentAssertions;

trait AssertsLatticeComponents
{
    /**
     * @param  JsonSerializable|array<string, mixed>  $component
     */
    public function assertLatticeComponent(JsonSerializable|array $component): ComponentAssertions
    {
        $wire = is_array($component)
            ? $component
            : json_decode(json_encode($component, JSON_THROW_ON_ERROR), true);

        return new ComponentAssertions(new ComponentNode($wire));
    }

    /**
     * @param  TestResponse<Response>  $response
     */
    public function assertLatticePage(TestResponse $response): ComponentAssertions
    {
        $page = AssertableInertia::fromTestResponse($response)->toArray();
        $schema = $page['props']['lattice']['schema'] ?? [];

        return new ComponentAssertions(ComponentNode::root(is_array($schema) ? $schema : []));
    }

    /**
     * @param  TestResponse<Response>  $response
     */
    public function assertLatticeLayout(TestResponse $response): ComponentAssertions
    {
        $page = AssertableInertia::fromTestResponse($response)->toArray();
        $schema = $page['props']['lattice']['layout']['schema'] ?? [];

        return new ComponentAssertions(ComponentNode::root(is_array($schema) ? $schema : []));
    }
}
