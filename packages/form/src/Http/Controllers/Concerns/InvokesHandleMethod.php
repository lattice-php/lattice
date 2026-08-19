<?php
declare(strict_types=1);

namespace Lattice\Form\Http\Controllers\Concerns;

use BadMethodCallException;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Lattice\Core\Facades\Evaluate;
use Lattice\Form\FormData;

/**
 * Invokes a definition's flexible handle() method. Parameters resolve by
 * name ($data, $request, $records), by type (FormData, Request, Collection),
 * or fall back to the container.
 */
trait InvokesHandleMethod
{
    /**
     * @param  Collection<int, mixed>|null  $records
     */
    protected function invokeHandle(object $definition, Request $request, FormData $data, ?Collection $records = null): mixed
    {
        if (! method_exists($definition, 'handle')) {
            throw new BadMethodCallException(sprintf(
                '%s must declare a public handle() method — type the parameters you need, e.g. handle(FormData $data).',
                $definition::class,
            ));
        }

        $context = Evaluate::context()
            ->named('data', $data)
            ->named('request', $request)
            ->typed(FormData::class, $data)
            ->typed(Request::class, $request);

        if ($records instanceof Collection) {
            $context = $context->named('records', $records)->typed(Collection::class, $records);
        }

        return Evaluate::resolve($definition->handle(...), $context);
    }
}
