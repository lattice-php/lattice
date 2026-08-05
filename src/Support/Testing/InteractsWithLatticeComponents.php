<?php

declare(strict_types=1);

namespace Lattice\Support\Testing;

use Closure;
use Illuminate\Foundation\Testing\TestCase;
use Illuminate\Http\Request;
use Illuminate\Testing\TestResponse;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionRegistry;
use Lattice\Actions\BulkActionDefinition;
use Lattice\Actions\BulkActionRegistry;
use Lattice\Actions\Components\Action;
use Lattice\Actions\Components\BulkAction;
use Lattice\Core\Attributes\AsAction;
use Lattice\Core\Attributes\AsBulkAction;
use Lattice\Core\Attributes\AsForm;
use Lattice\Core\Attributes\AsTable;
use Lattice\Core\Attributes\DefinitionAttribute;
use Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Core\Services\ComponentReferenceSigner;
use Lattice\Core\Support\Wire;
use Lattice\Form\Components\Form;
use Lattice\Form\FormDefinition;
use Lattice\Form\FormRegistry;
use Lattice\Fragments\Components\Fragment;
use Lattice\Fragments\FragmentDefinition;
use Lattice\Table\Components\Table;
use Lattice\Table\TableDefinition;
use Lattice\Table\TableRegistry;
use RuntimeException;
use Spatie\Attributes\Attributes;
use Symfony\Component\HttpFoundation\Response;

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
     * @return LatticeTestResponse<Response>
     */
    public function submitForm(string $form, array $data = [], array $context = []): LatticeTestResponse
    {
        $component = $this->sealLatticeComponent(fn (): Form => Form::use($form, $context));

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
     * @return LatticeTestResponse<Response>
     */
    public function callAction(string $action, array $data = [], array $context = []): LatticeTestResponse
    {
        $component = $this->sealLatticeComponent(fn (): Action => Action::use($action, $context));

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
     * @return LatticeTestResponse<Response>
     */
    public function callBulkAction(string $bulkAction, array $data = [], array $context = []): LatticeTestResponse
    {
        $component = $this->sealLatticeComponent(fn (): BulkAction => BulkAction::use($bulkAction, $context));

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
     * @return LatticeTestResponse<Response>
     */
    public function loadTable(string $table, array $query = [], array $context = []): LatticeTestResponse
    {
        $component = $this->sealLatticeComponent(fn (): Table => Table::use($table, $context));
        $url = $component['props']['endpoint'];

        if ($query !== []) {
            $url .= '?'.http_build_query($query);
        }

        return $this->latticeTestResponse(
            $this->getJson($url, $this->latticeHeaders($component)),
        );
    }

    /**
     * @param  class-string<FragmentDefinition>  $fragment
     * @param  array<string, mixed>  $context
     * @return LatticeTestResponse<Response>
     */
    public function loadFragment(string $fragment, array $context = []): LatticeTestResponse
    {
        $component = $this->sealLatticeComponent(fn (): Fragment => Fragment::lazy($fragment, $context));

        return $this->latticeTestResponse(
            $this->getJson(
                $component['props']['endpoint'],
                $this->latticeHeaders($component),
            ),
        );
    }

    /**
     * Drive an action whose authorize() denies the current actor. The normal
     * serialize path refuses to emit a hidden component ({@see Action::use()}
     * returns it un-signed), so this seals a ref directly against the
     * definition's registered key and hits the live endpoint — the same
     * recipe {@see \RenderAuthorizationTest} uses — to observe the 403 a
     * denied real request gets.
     *
     * @param  class-string<ActionDefinition>  $action
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $context
     * @return LatticeTestResponse<Response>
     */
    public function callDeniedAction(string $action, array $data = [], array $context = []): LatticeTestResponse
    {
        $key = $this->deniedDefinitionKey($action, AsAction::class);

        return $this->latticeRequest(
            'post',
            app(ActionRegistry::class)->endpointFor($key),
            $data,
            $this->sealDeniedRef('action', $key, $context),
        );
    }

    /**
     * @param  class-string<FormDefinition>  $form
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $context
     * @return LatticeTestResponse<Response>
     */
    public function submitDeniedForm(string $form, array $data = [], array $context = []): LatticeTestResponse
    {
        $key = $this->deniedDefinitionKey($form, AsForm::class);

        return $this->latticeRequest(
            'post',
            app(FormRegistry::class)->endpointFor($key),
            $data,
            $this->sealDeniedRef('form', $key, $context),
        );
    }

    /**
     * @param  class-string<TableDefinition>  $table
     * @param  array<string, mixed>  $query
     * @param  array<string, mixed>  $context
     * @return LatticeTestResponse<Response>
     */
    public function loadDeniedTable(string $table, array $query = [], array $context = []): LatticeTestResponse
    {
        $key = $this->deniedDefinitionKey($table, AsTable::class);
        $url = app(TableRegistry::class)->endpointFor($key);

        if ($query !== []) {
            $url .= '?'.http_build_query($query);
        }

        return $this->latticeTestResponse(
            $this->getJson($url, $this->latticeHeaders($this->sealDeniedRef('table', $key, $context))),
        );
    }

    /**
     * Bulk actions are pinned to their table, so pass the table slug via
     * context, e.g. `['table' => 'team.members']`.
     *
     * @param  class-string<BulkActionDefinition>  $bulkAction
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $context
     * @return LatticeTestResponse<Response>
     */
    public function callDeniedBulkAction(string $bulkAction, array $data = [], array $context = []): LatticeTestResponse
    {
        $key = $this->deniedDefinitionKey($bulkAction, AsBulkAction::class);

        return $this->latticeRequest(
            'post',
            app(BulkActionRegistry::class)->endpointFor($key),
            $data,
            $this->sealDeniedRef('action.bulk', $key, $context),
        );
    }

    /**
     * @param  class-string  $definition
     * @param  class-string<DefinitionAttribute>  $attributeClass
     */
    private function deniedDefinitionKey(string $definition, string $attributeClass): string
    {
        $attribute = Attributes::get($definition, $attributeClass);

        if (! $attribute instanceof DefinitionAttribute) {
            throw new RuntimeException(sprintf(
                'Lattice definition [%s] is missing the [%s] attribute.',
                $definition,
                class_basename($attributeClass),
            ));
        }

        return $attribute->key;
    }

    /**
     * @param  array<string, mixed>  $context
     */
    private function sealDeniedRef(string $type, string $key, array $context): string
    {
        $this->refreshLatticeRequestIdentity();

        return app(SignsComponentReferences::class)->seal($type, $key, $context);
    }

    /**
     * Builds the component only after the request identity is refreshed. The
     * component must not be built by the caller: a `can` declared on its
     * attribute is resolved against the container's request at build time, and
     * the stale request a previous dispatch left bound carries no user — the
     * gate would deny and the component would come back hidden.
     *
     * @param  Closure(): mixed  $build
     * @return array<string, mixed>
     */
    private function sealLatticeComponent(Closure $build): array
    {
        $this->refreshLatticeRequestIdentity();

        return Wire::toArray($build());
    }

    /**
     * Rebinds a session-less request into the container before sealing a ref.
     *
     * Lattice's JSON test helpers (postJson/patchJson/…) don't forward session
     * cookies between calls, so every dispatched request gets a brand-new
     * session id. If the container is still holding the request object a
     * previous helper call left behind (Laravel's kernel leaves the last
     * dispatched request bound after handling), sealing against it would bake
     * that earlier session's hash into the new ref — which then never matches
     * the fresh session the next dispatch actually gets, and the signer 403s.
     * Rebinding a pristine, session-less request restores the "no session
     * claim yet" identity {@see ComponentReferenceSigner}
     * already treats as a wildcard match, so the seal matches whatever session
     * the next request ends up with. Binding via `app()->instance('request', ...)`
     * triggers Auth's rebind callback, which reinstalls a user resolver
     * delegating to the auth manager — so `actingAs()` keeps working.
     */
    private function refreshLatticeRequestIdentity(): void
    {
        app()->instance('request', Request::create('/'));
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
     * @param  array<string, mixed>|string  $component
     * @return TestResponse<Response>
     */
    protected function latticeGet(string $url, array|string $component): TestResponse
    {
        return $this->getJson($url, $this->latticeHeaders($component));
    }

    /**
     * @param  array<string, mixed>  $data
     * @return LatticeTestResponse<Response>
     */
    private function latticeRequest(string $method, string $url, array $data, string $ref): LatticeTestResponse
    {
        $headers = $this->latticeHeaders($ref);

        $response = match (strtolower($method)) {
            'put' => $this->putJson($url, $data, $headers),
            'patch' => $this->patchJson($url, $data, $headers),
            'delete' => $this->deleteJson($url, $data, $headers),
            default => $this->postJson($url, $data, $headers),
        };

        return $this->latticeTestResponse($response);
    }

    /**
     * @template TResponse of Response
     *
     * @param  TestResponse<TResponse>  $response
     * @return LatticeTestResponse<TResponse>
     */
    private function latticeTestResponse(TestResponse $response): LatticeTestResponse
    {
        return LatticeTestResponse::fromBaseResponse($response->baseResponse, $response->baseRequest)
            ->withExceptions($response->exceptions);
    }
}
