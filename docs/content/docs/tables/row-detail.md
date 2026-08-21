---
title: Row detail
description: Expandable rows that fold open a lazy Fragment detail, loaded over AJAX when the row opens.
---

Override `rowDetail()` to make a row expandable. Each expandable row gets a chevron that folds a detail
panel open beneath it. The detail is a [`Fragment`](/core/fragments/) loaded over AJAX **when the row
opens** — nothing is fetched for collapsed rows — so the detail can be as rich as you like without
weighing down the table payload.

```php
use Lattice\Fragments\Components\Fragment;

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
use Lattice\Core\Attributes\AsFragment;
use Lattice\Core\PageSchema;
use Lattice\Fragments\FragmentDefinition;

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

## Row links

Override `rowUrl()` to make a whole row navigate, like a link, to a detail page. Clicking anywhere on
the row visits the URL; the row gets a hover highlight and a pointer cursor.

```php
public function rowUrl(array $row): ?string
{
    return route('products.edit', $row['id']);
}
```

Return `null` for rows that should not navigate. Clicks on an interactive element inside the row — a
checkbox, the expand chevron, an action button or link — are left alone. Cmd/ctrl-click and
middle-click open the URL in a new tab instead of navigating in place.
