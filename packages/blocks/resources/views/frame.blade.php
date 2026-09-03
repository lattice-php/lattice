<div class="{{ trim('lt-blocks-frame '.$classes['outer']) }}"{!! $node->style->anchor === null ? '' : ' id="'.e($node->style->anchor).'"' !!} data-block-type="{{ $node->type }}">
    <div class="{{ $classes['inner'] }}">{{ $content }}</div>
</div>
