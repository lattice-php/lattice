<?php
declare(strict_types=1);

return [
    'library' => [
        'empty' => 'No media yet. Drop files anywhere to upload.',
        'no-results' => 'No media matches your search.',
        'search' => 'Search media',
        'select' => 'Select :name',
        'selected' => ':count selected',
        'upload-dismiss' => 'Dismiss :name',
        'upload-failed' => 'Upload failed',
        'upload-retry' => 'Retry :name',
        'uploaded' => ':count file(s) uploaded',
    ],
    'detail' => [
        'close' => 'Close details',
        'download' => 'Download',
        'empty' => 'Select a file to see its details.',
        'full-view' => 'Open full view',
        'save' => 'Save',
        'url' => 'URL',
    ],
    'sort' => [
        'label' => 'Sort by',
        'name-asc' => 'Name A–Z',
        'name-desc' => 'Name Z–A',
        'newest' => 'Newest first',
        'oldest' => 'Oldest first',
        'size-asc' => 'Smallest first',
        'size-desc' => 'Largest first',
    ],
    'view' => [
        'label' => 'View',
        'grid' => 'Grid',
        'list' => 'List',
    ],
    'picker' => [
        'confirm' => 'Select :count item(s)',
        'heading' => 'Choose media',
        'open' => 'Choose from library',
        'remove' => 'Remove :name',
        'selected-of-max' => ':count/:max selected',
    ],
    'editor' => [
        'insert' => 'Insert image',
        'alt' => 'Alt text',
        'size' => 'Size',
        'original' => 'Original',
        'missing' => 'Missing media',
        'not-attachable' => 'Media #:id is not available.',
    ],
    'validation' => [
        'not-attachable' => 'The selected file is not available.',
    ],
    'columns' => [
        'preview' => 'Preview',
        'original' => 'Original file',
        'name' => 'Name',
        'type' => 'Type',
        'size' => 'Size',
        'alt' => 'Alt text',
        'uploaded-at' => 'Uploaded',
        'usage' => 'Used',
    ],
    'filters' => [
        'type' => [
            'all' => 'All types',
            'label' => 'Type',
            'image' => 'Images',
            'video' => 'Video',
            'audio' => 'Audio',
            'document' => 'Documents',
        ],
    ],
    'actions' => [
        'upload' => [
            'label' => 'Upload',
            'toast' => ':count file(s) uploaded',
        ],
        'update' => [
            'label' => 'Edit',
            'toast' => 'File updated',
        ],
        'delete' => [
            'confirm-description' => 'This file is attached to :count record(s). Deleting removes it everywhere.',
            'confirm-title' => 'Delete this file?',
            'label' => 'Delete',
            'toast' => 'File deleted',
        ],
        'delete-selected' => [
            'label' => 'Delete selected',
            'toast' => ':count file(s) deleted',
        ],
    ],
];
