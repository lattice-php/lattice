<?php

declare(strict_types=1);

use Bambamboole\Lattice\Components\Form\Form;
use Bambamboole\Lattice\Components\Form\RichEditor;
use Bambamboole\Lattice\Forms\FormDefinition;
use Bambamboole\Lattice\Forms\RichContent;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * @return array<string, mixed>
 */
function richDocument(): array
{
    return [
        'type' => 'doc',
        'content' => [
            [
                'type' => 'paragraph',
                'content' => [
                    ['type' => 'text', 'text' => 'Hi '],
                    ['type' => 'text', 'text' => 'bold', 'marks' => [['type' => 'bold']]],
                ],
            ],
        ],
    ];
}

it('renders a document to sanitized html', function (): void {
    expect(RichContent::make(richDocument())->toHtml())->toBe('<p>Hi <strong>bold</strong></p>');
});

it('returns empty html for an empty document', function (): void {
    expect(RichContent::make(null)->toHtml())->toBe('')
        ->and(RichContent::make([])->toHtml())->toBe('');
});

it('strips nodes that are not in the schema', function (): void {
    $doc = [
        'type' => 'doc',
        'content' => [
            ['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'ok']]],
            ['type' => 'evilScript', 'attrs' => ['onload' => 'alert(1)']],
        ],
    ];

    expect(RichContent::make($doc)->toHtml())->not->toContain('evilScript')
        ->and(RichContent::make($doc)->toHtml())->not->toContain('onload');
});

it('decodes the submitted json document during validation', function (): void {
    $definition = new class extends FormDefinition
    {
        public function definition(Form $form, Request $request): Form
        {
            return $form->schema([
                RichEditor::make('body', 'Body')->rules(['required']),
            ]);
        }

        public function handle(Request $request): Response
        {
            return new Response('ok');
        }
    };

    $validated = $definition->validate(Request::create('/', 'POST', [
        'body' => json_encode(richDocument()),
    ]));

    expect($validated['body'])->toBeArray()
        ->and($validated['body']['type'])->toBe('doc')
        ->and($validated['body']['content'][0]['type'])->toBe('paragraph');
});
