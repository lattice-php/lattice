<?php
declare(strict_types=1);

namespace Lattice\Table\Filters;

use Illuminate\Http\Request;
use Lattice\Core\Option;
use Lattice\Form\Components\Select;
use Lattice\Form\FormData;
use Lattice\Form\FormSchemaWalker;
use Symfony\Component\HttpFoundation\Response;

/**
 * Resolves options for a searchable filter field addressed by a `filter:<key>`
 * or `filter:<key>.<field>` sub-request target — shared between the table and
 * board registries so both search seams walk the same filter schema.
 */
final class FilterFieldOptionsResolver
{
    /**
     * @param  array<int, Filter>  $filters
     * @return list<Option>
     */
    public static function resolve(array $filters, string $target, string $query, Request $request): array
    {
        [$filterKey, $fieldKey] = str_contains($target, '.')
            ? explode('.', $target, 2)
            : [$target, 'value'];

        $filter = array_find($filters, fn (Filter $filter): bool => $filter->key() === $filterKey);

        abort_if($filter === null, Response::HTTP_NOT_FOUND);

        $instance = app(FormSchemaWalker::class)->find($filter->schema(), $fieldKey, FormData::fromRequest($request));

        abort_if($instance === null, Response::HTTP_NOT_FOUND);

        $field = $instance->field;

        abort_unless($field instanceof Select && $field->isSearchable(), Response::HTTP_UNPROCESSABLE_ENTITY);

        return $field->resolveSearch($query, $instance->scope, $request);
    }
}
