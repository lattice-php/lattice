<div class="lt-blocks-gallery grid gap-4 {{ $columnsClass }}">
    @foreach ($images as $image)
        <img src="{{ $image['src'] }}" alt="{{ $image['alt'] }}" class="w-full rounded-lt" loading="lazy">
    @endforeach
</div>
