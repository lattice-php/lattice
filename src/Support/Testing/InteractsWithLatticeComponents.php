<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\Testing;

use Illuminate\Foundation\Testing\TestCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Testing\TestResponse;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\BulkActionDefinition;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Actions\Components\BulkAction;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Fragments\Components\Fragment;
use Lattice\Lattice\Fragments\FragmentDefinition;
use Lattice\Lattice\Support\Wire;
use Lattice\Lattice\Tables\Components\Table;
use Lattice\Lattice\Tables\TableDefinition;
use RuntimeException;

/**
 * Submit to the generic Lattice endpoints with a ref sealed from a component
 * class plus its context, exactly like a rendered component would. Mix into a
 * test case to drive forms, actions, tables, bulk actions and fragments without
 * hand-building the signed ref and headers.
 *
 * @mixin TestCase
 */
trait InteractsWithLatticeComponents
{
    use AssertsLatticeComponents;

    /**
     * @param  class-string<FormDefinition>  $form
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $context
     * @return TestResponse<JsonResponse>
     */
    public function submitForm(string $form, array $data = [], array $context = []): TestResponse
    {
        $component = $this->sealLatticeComponent(Form::use($form, $context));

        return $this->latticeRequest(
            $component['props']['method'] ?? 'post',
            $component['props']['action'],
            $data,
            $this->latticeRef($component),
        );
    }

    /**
     * @param  class-string<ActionDefinition>  $action
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $context
     * @return TestResponse<JsonResponse>
     */
    public function callAction(string $action, array $data = [], array $context = []): TestResponse
    {
        $component = $this->sealLatticeComponent(Action::use($action, $context));

        return $this->latticeRequest(
            $component['props']['method'] ?? 'post',
            $component['props']['endpoint'],
            $data,
            $this->latticeRef($component),
        );
    }

    /**
     * Bulk actions are pinned to their table, so pass the table slug via
     * context, e.g. `['table' => 'team.members']`.
     *
     * @param  class-string<BulkActionDefinition>  $bulkAction
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $context
     * @return TestResponse<JsonResponse>
     */
    public function callBulkAction(string $bulkAction, array $data = [], array $context = []): TestResponse
    {
        $component = $this->sealLatticeComponent(BulkAction::use($bulkAction, $context));

        return $this->latticeRequest(
            $component['props']['method'] ?? 'post',
            $component['props']['endpoint'],
            $data,
            $this->latticeRef($component),
        );
    }

    /**
     * @param  class-string<TableDefinition>  $table
     * @param  array<string, mixed>  $query
     * @param  array<string, mixed>  $context
     * @return TestResponse<JsonResponse>
     */
    public function loadTable(string $table, array $query = [], array $context = []): TestResponse
    {
        $component = $this->sealLatticeComponent(Table::use($table, $context));
        $url = $component['props']['endpoint'];

        if ($query !== []) {
            $url .= '?'.http_build_query($query);
        }

        return $this->getJson($url, $this->latticeHeaders($component));
    }

    /**
     * @param  class-string<FragmentDefinition>  $fragment
     * @param  array<string, mixed>  $context
     * @return TestResponse<JsonResponse>
     */
    public function loadFragment(string $fragment, array $context = []): TestResponse
    {
        $component = $this->sealLatticeComponent(Fragment::lazy($fragment, $context));

        return $this->getJson(
            $component['props']['endpoint'],
            $this->latticeHeaders($component),
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function sealLatticeComponent(mixed $component): array
    {
        return Wire::toArray($component);
    }

    /**
     * @param  array<string, mixed>|string  $component
     */
    protected function latticeRef(array|string $component): string
    {
        if (is_string($component)) {
            return $component;
        }

        $props = $component['props'] ?? [];
        $ref = is_array($props) ? ($props['ref'] ?? null) : null;

        if (! is_string($ref) || $ref === '') {
            throw new RuntimeException('Lattice component ref is missing.');
        }

        return $ref;
    }

    /**
     * @param  array<string, mixed>|string  $component
     * @param  array<string, string>  $headers
     * @return array<string, string>
     */
    protected function latticeHeaders(array|string $component, array $headers = []): array
    {
        return array_merge(['X-Lattice-Ref' => $this->latticeRef($component)], $headers);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return TestResponse<JsonResponse>
     */
    private function latticeRequest(string $method, string $url, array $data, string $ref): TestResponse
    {
        $headers = $this->latticeHeaders($ref);

        return match (strtolower($method)) {
            'put' => $this->putJson($url, $data, $headers),
            'patch' => $this->patchJson($url, $data, $headers),
            'delete' => $this->deleteJson($url, $data, $headers),
            default => $this->postJson($url, $data, $headers),
        };
    }
}
