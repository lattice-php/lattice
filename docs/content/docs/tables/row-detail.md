---
title: Row detail
description: Expandable rows that fold open a lazy Fragment detail, loaded over AJAX when the row opens.
---

Override `rowDetail()` to make a row expandable. Each expandable row gets a chevron that folds a detail
panel open beneath it. The detail is a [`Fragment`](/core/fragments/) loaded over AJAX **when the row
opens** — nothing is fetched for collapsed rows — so the detail can be as rich as you like without
weighing down the table payload.

```php
use Lattice\Lattice\Fragments\Components\Fragment;

public function rowDetail(array $row): ?Fragment
{
    return Fragment::lazy(OrderLinesFragment::class, ['orderId' => $row['id']]);
}
```

Return `null` for rows that should not expand — those rows simply show no chevron.

## The detail fragment

The detail lives in its own [`#[AsFragment]`](/core/fragments/) class, authored and tested
independently of the table. It reads the row context you passed to `Fragment::lazy()`:

```php
use Lattice\Lattice\Attributes\AsFragment;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Fragments\FragmentDefinition;

#[AsFragment('order-lines')]
final class OrderLinesFragment extends FragmentDefinition
{
    public function schema(PageSchema $schema): PageSchema
    {
        $order = Order::with('lines')->findOrFail($this->context('orderId'));

        return $schema->component(/* … the order's lines … */);
    }
}
```

Because it is a real fragment, the detail inherits the whole [Fragment](/core/fragments/) pipeline: a
signed per-row endpoint, authorization, the loading skeleton, and per-fragment reload events.

## Behavior

- The chevron toggles the row; the rest of the row stays free for [row actions](/tables/actions/) and
  links.
- Several rows can be open at once.
- Expansion is client-side and resets when the table reloads, re-sorts, re-filters, or paginates; the
  detail re-fetches each time a row opens.

:::note
`rowDetail()` returns a `Fragment` and nothing else — the detail always loads over AJAX. This keeps
large or expensive detail off the initial table response.
:::
