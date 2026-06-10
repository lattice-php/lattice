---
title: Navigation
description: Menus and the sidebar, defined in PHP and surfaced to the React shell.
---

Navigation is defined in PHP. The simplest path is adding `->sidebar('Label', $icon)` to a `latticePage` route, which registers a menu entry alongside the page it points at. Menus are collected server-side and surfaced to the React shell, so navigation stays in sync with the pages it links to.

See [Getting Started](/introduction/getting-started/) for adding a page to the sidebar.

:::note
Full Navigation reference is being written. For now, the [Core Concepts](/introduction/core-concepts/) overview covers the navigation model.
:::
