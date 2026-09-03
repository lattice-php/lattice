<div class="flex items-center justify-between gap-6 rounded-lt bg-lt-fg px-6 py-5 text-lt-bg">
    <div class="flex flex-col gap-1">
        <h3 class="text-lg font-semibold">{{ $title }}</h3>
        @if ($text !== '')
            <p class="text-sm opacity-80">{{ $text }}</p>
        @endif
    </div>
    <span class="inline-flex items-center rounded-lt bg-lt-bg px-4 py-2 text-sm font-semibold text-lt-fg">{{ $buttonLabel }}</span>
</div>
