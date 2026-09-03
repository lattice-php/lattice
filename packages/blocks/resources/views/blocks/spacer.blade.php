@php
    $height = ['sm' => 'h-4', 'md' => 'h-8', 'lg' => 'h-16', 'xl' => 'h-32'][$size] ?? 'h-8';
@endphp
<div class="lt-blocks-spacer {{ $height }}" aria-hidden="true"></div>
