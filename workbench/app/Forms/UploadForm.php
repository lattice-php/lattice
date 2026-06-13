<?php
declare(strict_types=1);

namespace Workbench\App\Forms;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\Form;
use Lattice\Lattice\Forms\Components\FileUpload;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\FormDefinition;
use Symfony\Component\HttpFoundation\Response;

#[Form('workbench.upload.form')]
class UploadForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form->schema([
            FileUpload::make('avatar')->image()->maxSize(2048),
            FileUpload::make('document')->disk('s3')->signedUpload(),
        ]);
    }

    public function handle(Request $request): Response
    {
        $validated = $this->validate($request);

        return redirect('/uploads')->with('upload', $validated);
    }
}
