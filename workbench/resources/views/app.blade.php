<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title inertia>Lattice</title>
    @if (app()->isLocal() && ! app()->runningUnitTests() && Illuminate\Support\Facades\Vite::isRunningHot())
        <script crossorigin="anonymous" src="https://unpkg.com/react-scan@latest/dist/auto.global.js"></script>
    @endif
    @viteReactRefresh
    @vite(['workbench/resources/css/app.css', 'workbench/resources/js/app.tsx'])
    @inertiaHead
</head>
<body>
    @inertia
</body>
</html>
