<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Fields;

use Illuminate\Support\Facades\Storage;
use Lattice\Lattice\Attributes\AsPage;
use Workbench\App\Forms\Fields\FileUploadFieldForm;

#[AsPage(route: '/form/fields/file-upload')]
final class FileUploadPage extends FieldPage
{
    private const string EXISTING_PATH = 'uploads/avatar-existing.jpg';

    protected function form(): string
    {
        return FileUploadFieldForm::class;
    }

    protected function slug(): string
    {
        return 'file-upload';
    }

    #[\Override]
    protected function fill(): array
    {
        if (request()->query('state') !== 'existing') {
            return [];
        }

        $disk = Storage::disk('public');

        if (! $disk->exists(self::EXISTING_PATH)) {
            $disk->put(self::EXISTING_PATH, 'existing-avatar');
        }

        return ['avatar' => self::EXISTING_PATH];
    }
}
