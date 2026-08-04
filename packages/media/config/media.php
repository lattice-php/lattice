<?php
declare(strict_types=1);

use Lattice\Media\Models\Media;

return [
    /** Subclass `Media` and point this at your class to override `defaultConversions()`. */
    'model' => Media::class,

    'disk' => env('LATTICE_MEDIA_DISK', 'public'),
    'max_size' => env('LATTICE_MEDIA_MAX_SIZE', 10240),

    /** Mime patterns, `image/*` wildcards included; empty accepts every type. */
    'accepted_types' => [],
    'signed_uploads' => env('LATTICE_MEDIA_SIGNED_UPLOADS', false),

    /** Queue for conversion jobs; null uses the default queue. */
    'queue' => null,
];
