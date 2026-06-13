<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\Testing;

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

    public function assertLatticePage(TestResponse $response): ComponentAssertions
    {
        $schema = $this->extractLatticeSchema($response);

        return new ComponentAssertions(ComponentNode::root(is_array($schema) ? $schema : []));
    }

    /**
     * @return array<int, mixed>
     */
    private function extractLatticeSchema(TestResponse $response): array
    {
        if ($response->headers->has('X-Inertia')) {
            $page = $response->json();

            return $page['props']['lattice']['schema'] ?? [];
        }

        if ($response->baseRequest !== null) {
            $url = $response->baseRequest->getUri();
            $xhrResponse = $this->get($url, ['X-Inertia' => 'true']);
            $page = $xhrResponse->json();

            return $page['props']['lattice']['schema'] ?? [];
        }

        $schema = AssertableInertia::fromTestResponse($response)->toArray()['props']['lattice']['schema'] ?? [];

        return is_array($schema) ? $schema : [];
    }
}
