<section class="lt-blocks-section flex flex-col gap-6">
    @if ($title !== '')
        <h2 class="lt-blocks-heading">{{ $title }}</h2>
    @endif
    <div class="flex flex-col gap-4">{{ $content }}</div>
</section>
