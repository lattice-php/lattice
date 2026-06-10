---
title: Tables
description: Listings with columns, sorting, filtering, pagination, and row and bulk actions, backed by a pluggable data source.
---

A table is a listing backed by a **data source**. You declare columns — such as `TextColumn` and `StackColumn` — and Lattice handles sorting, filtering, and pagination, fetching rows from the table's endpoint. Lattice ships an Eloquent-backed source out of the box; you can back a table with any source — an array, a search index, an external API — by implementing the data-source interface. Filters support text, presence, and comparison operators per column, and rows and selections can carry actions.

:::note
Full Tables reference is being written. For now, the [Core Concepts](/introduction/core-concepts/) overview covers the table model.
:::
