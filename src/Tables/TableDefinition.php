<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Tables;

use Bambamboole\Lattice\Components\Core\Component;
use Bambamboole\Lattice\Tables\Columns\Column;
use Illuminate\Http\Request;

abstract class TableDefinition
{
    /**
     * @return array<int, Column>
     */
    abstract public function columns(): array;

    public function perPage(): int
    {
        return 25;
    }

    public function pagination(): PaginationType|string
    {
        return PaginationType::Table;
    }

    public function paginationType(): PaginationType
    {
        $type = $this->pagination();

        return $type instanceof PaginationType ? $type : PaginationType::from($type);
    }

    public function layout(): string
    {
        return 'table';
    }

    public function authorize(Request $request): bool
    {
        return true;
    }

    /**
     * @param  array<string, mixed>  $row
     * @return array<int, Component>
     */
    public function actions(array $row): array
    {
        return [];
    }

    abstract public function query(TableQuery $query): TableResult;

    protected function context(Request $request, string $key, mixed $default = null): mixed
    {
        return data_get($request->input('context', []), $key, $default);
    }
}
