<?php
declare(strict_types=1);

namespace Workbench\App\Forms\Fields;

use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Forms\Components\FileUpload;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\Components\Repeater;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Ui\Components\Tab;
use Lattice\Lattice\Ui\Components\Tabs;
use Lattice\Lattice\Ui\Enums\Orientation;
use Symfony\Component\HttpFoundation\Response;

#[AsForm('workbench.fields.file-upload.form')]
class FileUploadFieldForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form->schema([
            Tabs::make('file-upload-variants')
                ->queryKey('type')
                ->orientation(Orientation::Vertical)
                ->defaultValue('basic')
                ->schema([
                    Tab::make('basic', __('workbench.fields.variants.basic'))->schema([
                        FileUpload::make('avatar')->image()->maxSize(2048),
                    ]),
                    Tab::make('signed', __('workbench.fields.file-upload.signed'))->schema([
                        FileUpload::make('document')->disk('s3')->signedUpload(),
                    ]),
                    Tab::make('repeater', __('workbench.fields.file-upload.repeater'))->schema([
                        Repeater::make('documents')->schema([
                            FileUpload::make('file')->disk('s3')->signedUpload(),
                        ]),
                    ]),
                ]),
        ]);
    }

    public function handle(Request $request): Response
    {
        $data = $this->validate($request);

        foreach (FileUpload::removed($request, 'avatar') as $path) {
            Storage::disk('public')->delete($path);
        }

        if (($data['avatar'] ?? null) instanceof UploadedFile) {
            $data['avatar'] = $data['avatar']->store('uploads', 'public');
        }

        session()->flash('upload', $data);

        return redirect('/form/fields/file-upload');
    }
}
