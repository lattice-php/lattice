<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title inertia>Lattice Standalone</title>
    @latticeHead
    @inertiaHead
</head>
<body>
    @inertia
    @latticeScripts
</body>
</html>
