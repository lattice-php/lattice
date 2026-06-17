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
     * @param  TestResponse<Response>  $response
     */
    private function latticeSchemaAssertions(TestResponse $response, string $schemaPath): ComponentAssertions
    {
        $page = AssertableInertia::fromTestResponse($response)->toArray();
        $schema = data_get($page, 'props.'.$schemaPath);

        return new ComponentAssertions(ComponentNode::root(is_array($schema) ? $schema : []));
    }
}
