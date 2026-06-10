---
title: Forms
description: Field definitions in PHP with server-side validation, conditional fields, and a dedicated submit endpoint.
---

A form is a set of field definitions — `TextInput`, `Textarea`, `Select`, `Choice`, `Checkbox`, `DateInput`, `NumberInput`, `PasswordInput`, `RichEditor`, and others. Validation runs on the server (live, through Laravel Precognition), and fields can show, hide, require, or disable themselves based on other fields through conditions. Each form posts to its own endpoint, which validates the input and handles the submission.

:::note
Full Forms reference is being written. For now, the [Core Concepts](/introduction/core-concepts/) overview covers the form model.
:::
