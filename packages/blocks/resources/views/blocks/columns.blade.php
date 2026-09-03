<div class="lt-blocks-columns grid grid-cols-1 gap-6 {{ $columnsClass }}">
    @foreach ($columns as $column)
        <div class="flex min-w-0 flex-col gap-4">{{ $column }}</div>
    @endforeach
</div>
