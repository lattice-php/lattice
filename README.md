<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/assets/logo-dark.svg">
    <img alt="Lattice" src="docs/assets/logo.svg" width="320">
  </picture>
</p>

<p align="center">
  <a href="https://packagist.org/packages/lattice-php/lattice"><img alt="Latest version on Packagist" src="https://img.shields.io/packagist/v/lattice-php/lattice.svg?style=flat-square"></a>
  <a href="https://www.npmjs.com/package/@lattice-php/lattice"><img alt="Latest version on npm" src="https://img.shields.io/npm/v/@lattice-php/lattice.svg?style=flat-square"></a>
  <a href="https://github.com/lattice-php/lattice/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/lattice-php/lattice/ci.yml?branch=main&label=CI&style=flat-square"></a>
  <a href="https://app.codecov.io/gh/lattice-php/lattice"><img alt="Pest coverage" src="https://img.shields.io/codecov/c/github/lattice-php/lattice/main?flag=pest&label=pest&style=flat-square"></a>
  <a href="https://app.codecov.io/gh/lattice-php/lattice"><img alt="Vitest coverage" src="https://img.shields.io/codecov/c/github/lattice-php/lattice/main?flag=vitest&label=vitest&style=flat-square"></a>
  <a href="https://packagist.org/packages/lattice-php/lattice"><img alt="Total downloads" src="https://img.shields.io/packagist/dt/lattice-php/lattice.svg?style=flat-square"></a>
  <a href="https://packagist.org/packages/lattice-php/lattice"><img alt="License" src="https://img.shields.io/packagist/l/lattice-php/lattice.svg?style=flat-square"></a>
</p>

<p align="center">
  <strong>Server-driven React components for Laravel and Inertia.</strong>
</p>

---

Lattice lets you describe your interface — pages, forms, tables, actions, and menus — in PHP on the server and render it with real React components on the client over Inertia. You keep building the way you already do in Laravel, while your users get a polished React front end, with no hand-wired API and no UI contract duplicated across two languages.

## Installation

```bash
composer require lattice-php/lattice
npm install @lattice-php/lattice
```

See [Installation](https://latticephp.com/introduction/installation/) for the full setup. No Node toolchain? Lattice also ships prebuilt assets — publish them with `php artisan lattice:assets` and skip the npm step entirely; see [No-build setup](https://latticephp.com/introduction/no-build/).

## Documentation

Full documentation, guides, and examples live at **[latticephp.com](https://latticephp.com)**.

## License

The MIT License (MIT). See [LICENSE.md](LICENSE.md) for details.
