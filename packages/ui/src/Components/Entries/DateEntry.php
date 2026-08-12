<?php
declare(strict_types=1);

namespace Lattice\Ui\Components\Entries;

use Lattice\Ui\Attributes\AsEntry;
use Lattice\Ui\Enums\DateTimeStyle;
use Lattice\Ui\Enums\EntryType;
use Lattice\Ui\Values\DateFormat;

#[AsEntry(EntryType::Date)]
class DateEntry extends Entry
{
    public DateFormat $format;

    public function __construct(?string $key = null)
    {
        parent::__construct($key);

        $this->format = DateFormat::date();
    }

    public function style(DateTimeStyle $style): static
    {
        $this->format = DateFormat::date($style);

        return $this;
    }

    public function dateTime(DateTimeStyle $style = DateTimeStyle::Medium): static
    {
        $this->format = DateFormat::dateTime($style);

        return $this;
    }
}
