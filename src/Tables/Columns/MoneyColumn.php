<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use Lattice\Lattice\Tables\Attributes\AsColumn;
use Lattice\Lattice\Tables\Enums\ColumnType;

/**
 * A numeric column rendered as currency on the client. The currency code is
 * either fixed for the whole column ({@see currency()}) or read per row from
 * another field ({@see currencyField()}); the cell formats with Intl, so symbol
 * placement and per-currency decimals follow the active locale.
 */
#[AsColumn(ColumnType::Money)]
class MoneyColumn extends NumericColumn
{
    public ?string $currency = null;

    public ?string $currencyField = null;

    public function currency(string $currency): static
    {
        $this->currency = $currency;

        return $this;
    }

    public function currencyField(string $field): static
    {
        $this->currencyField = $field;

        return $this;
    }
}
