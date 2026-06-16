<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Illuminate\Support\Facades\Storage;
use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\Components\Form;
use Workbench\App\Forms\UploadForm;

#[AsPage(route: '/uploads/edit')]
class UploadEditPage extends WorkbenchPage
{
    private const string EXISTING_PATH = 'uploads/avatar-existing.jpg';

    public function title(): string
    {
        return __('workbench.pages.upload-edit.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        $disk = Storage::disk('public');

        if (! $disk->exists(self::EXISTING_PATH)) {
            $disk->put(self::EXISTING_PATH, 'existing-avatar');
        }

        return $schema->schema([
            Stack::make('upload-edit-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make(__('workbench.pages.upload-edit.heading')),
                    Form::use(UploadForm::class)
                        ->method(HttpMethod::Post)
                        ->submitLabel(__('workbench.pages.upload-edit.submit'))
                        ->fill([
                            'avatar' => self::EXISTING_PATH,
                        ]),
                ]),
        ]);
    }
}
