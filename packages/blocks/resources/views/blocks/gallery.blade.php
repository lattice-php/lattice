@php
    $columnsClass = [2 => 'grid-cols-2', 3 => 'grid-cols-2 md:grid-cols-3', 4 => 'grid-cols-2 md:grid-cols-4'][$columns] ?? 'grid-cols-2 md:grid-cols-3';
@endphp
<div class="lt-blocks-gallery grid gap-4 {{ $columnsClass }}">
    @foreach ($images as $image)
        <img src="{{ $image['src'] }}" alt="{{ $image['alt'] }}" class="w-full rounded-lt" loading="lazy">
    @endforeach
</div>
