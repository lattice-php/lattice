<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $page->title }}</title>
    @latticeTheme
    @vite(['workbench/resources/css/app.css'])
</head>
<body class="bg-background text-lt-fg">
    <main class="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12" data-test="public-page">
        {{ $content }}
    </main>
</body>
</html>
