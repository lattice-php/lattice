<?php
declare(strict_types=1);

namespace Workbench\App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final readonly class FakeRemoteTodosController
{
    public function __invoke(Request $request): JsonResponse
    {
        abort_unless($request->bearerToken() === 'fake-workbench-todos-token', 403);

        return response()->json([
            'data' => [
                [
                    'id' => 1,
                    'title' => 'Review remote schema proposal',
                    'detail' => 'Confirm that nested nodes, data bindings, and direct browser fetches cover the POC.',
                    'status' => 'Today',
                    'actionLabel' => 'Open brief',
                    'actionHref' => '/workbench/remote-schema?todo=remote-schema-proposal',
                ],
                [
                    'id' => 2,
                    'title' => 'Validate browser token exchange',
                    'detail' => 'Check audience and scopes before handing a short-lived token to the frontend.',
                    'status' => 'Security',
                    'actionLabel' => 'Review token',
                    'actionHref' => '/workbench/remote-schema?todo=browser-token-exchange',
                ],
                [
                    'id' => 3,
                    'title' => 'Wire todo row actions',
                    'detail' => 'Keep this as a button link for now; remote actions can become a first-class component later.',
                    'status' => 'Next',
                    'actionLabel' => 'Open action',
                    'actionHref' => '/workbench/remote-schema?todo=row-action',
                ],
                [
                    'id' => 4,
                    'title' => 'Test localized schema requests',
                    'detail' => 'Make sure the backend forwards Accept-Language when resolving the external schema.',
                    'status' => 'QA',
                    'actionLabel' => 'Open test',
                    'actionHref' => '/workbench/remote-schema?todo=accept-language',
                ],
                [
                    'id' => 5,
                    'title' => 'Prepare remote chat handoff',
                    'detail' => 'Use the full-size AI chat panel to reason about the selected todo context.',
                    'status' => 'AI',
                    'actionLabel' => 'Open chat',
                    'actionHref' => '/workbench/remote-schema?todo=remote-chat',
                ],
            ],
        ]);
    }
}
