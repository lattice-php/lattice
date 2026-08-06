<?php
declare(strict_types=1);

return [
    'library' => [
        'empty' => 'Noch keine Medien. Dateien zum Hochladen hier ablegen.',
        'no-results' => 'Keine Medien entsprechen deiner Suche.',
        'search' => 'Medien suchen',
        'select' => ':name auswählen',
        'selected' => ':count ausgewählt',
        'upload-dismiss' => ':name ausblenden',
        'upload-failed' => 'Upload fehlgeschlagen',
        'upload-retry' => ':name erneut versuchen',
        'uploaded' => ':count Datei(en) hochgeladen',
    ],
    'detail' => [
        'download' => 'Herunterladen',
        'save' => 'Speichern',
    ],
    'picker' => [
        'confirm' => ':count Element(e) auswählen',
        'heading' => 'Medien auswählen',
        'open' => 'Aus Mediathek wählen',
        'remove' => ':name entfernen',
        'selected-of-max' => ':count/:max ausgewählt',
    ],
    'editor' => [
        'insert' => 'Bild einfügen',
        'alt' => 'Alternativtext',
        'size' => 'Größe',
        'original' => 'Original',
        'missing' => 'Fehlende Datei',
        'not-attachable' => 'Datei #:id ist nicht verfügbar.',
    ],
    'validation' => [
        'not-attachable' => 'Die ausgewählte Datei ist nicht verfügbar.',
    ],
    'columns' => [
        'preview' => 'Vorschau',
        'original' => 'Originaldatei',
        'name' => 'Name',
        'type' => 'Typ',
        'size' => 'Größe',
        'alt' => 'Alt-Text',
        'uploaded-at' => 'Hochgeladen',
        'usage' => 'Verwendet',
    ],
    'filters' => [
        'type' => [
            'all' => 'Alle Typen',
            'label' => 'Typ',
            'image' => 'Bilder',
            'video' => 'Video',
            'audio' => 'Audio',
            'document' => 'Dokumente',
        ],
    ],
    'actions' => [
        'upload' => [
            'label' => 'Hochladen',
            'toast' => ':count Datei(en) hochgeladen',
        ],
        'update' => [
            'label' => 'Bearbeiten',
            'toast' => 'Datei aktualisiert',
        ],
        'delete' => [
            'confirm-description' => 'Diese Datei ist mit :count Datensatz(en) verknüpft. Das Löschen entfernt sie überall.',
            'confirm-title' => 'Datei löschen?',
            'label' => 'Löschen',
            'toast' => 'Datei gelöscht',
        ],
        'delete-selected' => [
            'label' => 'Ausgewählte löschen',
            'toast' => ':count Datei(en) gelöscht',
        ],
    ],
];
