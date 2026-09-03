<figure class="lt-blocks-image flex flex-col gap-2">
    <img src="{{ $src }}" alt="{{ $alt }}" class="w-full rounded-lt" loading="lazy">
    @if ($caption !== '')
        <figcaption class="text-sm text-lt-muted-fg">{{ $caption }}</figcaption>
    @endif
</figure>
