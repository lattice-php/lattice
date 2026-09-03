<div class="flex flex-col gap-4">
    <h1 class="text-4xl font-bold tracking-tight">{{ $title }}</h1>
    {!! $intro !!}
    @if ($buttonLabel !== '')
        <a href="{{ $buttonTarget }}" class="inline-flex w-fit items-center rounded-lt bg-lt-fg px-4 py-2 text-sm font-semibold text-lt-bg">{{ $buttonLabel }}</a>
    @endif
    @if ($imageSrc !== null)
        <img src="{{ $imageSrc }}" alt="" class="w-full rounded-lt" loading="lazy">
    @endif
</div>
