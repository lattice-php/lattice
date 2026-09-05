<?php

declare(strict_types=1);

namespace Lattice\Support\Testing;

use Illuminate\Http\Response;
use Illuminate\Testing\TestResponse;
use Inertia\Testing\AssertableInertia;
use JsonSerializable;
use Lattice\Core\Support\Wire;
use Lattice\Support\Testing\Assertions\ComponentAssertions;
use Lattice\Support\Testing\Assertions\EffectAssertions;

trait AssertsLatticeComponents
{
    /**
     * @param  JsonSerializable|array<string, mixed>  $component
     */
    public function assertLatticeComponent(JsonSerializable|array $component): ComponentAssertions
    {
        $wire = is_array($component)
            ? $component
            : Wire::toArray($component);

        return new ComponentAssertions(new ComponentNode($wire));
    }

    /**
     * @param  TestResponse<Response>  $response
     */
    public function assertLatticePage(TestResponse $response): ComponentAssertions
    {
        return $this->latticeSchemaAssertions($response, 'lattice.schema');
    }

    /**
     * @param  TestResponse<Response>  $response
     */
    public function assertLatticeLayout(TestResponse $response): ComponentAssertions
    {
        return $this->latticeSchemaAssertions($response, 'lattice.layout.schema');
    }

    /**
     * The effects flashed onto this response through the `latticeEffects` bag.
     * A page render drains them client-side, so they never reach the rendered
     * schema — assert on them here instead of digging through the Inertia page.
     *
     * @param  TestResponse<Response>  $response
     */
    public function assertLatticeEffects(TestResponse $response): EffectAssertions
    {
        $flashed = data_get(AssertableInertia::fromTestResponse($response)->toArray(), 'flash.latticeEffects', []);

        return new EffectAssertions(array_values(array_map(
            Wire::toArray(...),
            is_array($flashed) ? $flashed : [],
        )));
    }

    /**
     * @param  TestResponse<Response>  $response
     */
    private function latticeSchemaAssertions(TestResponse $response, string $schemaPath): ComponentAssertions
    {
        $page = AssertableInertia::fromTestResponse($response)->toArray();
        $schema = data_get($page, 'props.'.$schemaPath);

        return new ComponentAssertions(ComponentNode::root(is_array($schema) ? $schema : []));
    }
}
