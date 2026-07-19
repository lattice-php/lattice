<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Fields;

use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Ui\Components\Heading;
use Lattice\Lattice\Ui\Components\Stack;
use Lattice\Lattice\Ui\Components\Text;
use Lattice\Lattice\Ui\Enums\Gap;
use Lattice\Lattice\Ui\Enums\HttpMethod;
use Workbench\App\Pages\WorkbenchPage;

abstract class FieldPage extends WorkbenchPage
{
    /** @return class-string<FormDefinition> */
    abstract protected function form(): string;

    abstract protected function slug(): string;

    public function title(): string
    {
        return __('workbench.pages.fields.'.$this->slug().'.title');
    }

    /** @return array<string, mixed> */
    protected function fill(): array
    {
        return [];
    }

    public function render(PageSchema $schema): PageSchema
    {
        $form = Form::use($this->form())->method(HttpMethod::Post);

        if ($this->fill() !== []) {
            $form->fill($this->fill());
        }

        return $schema->schema([
            Stack::make($this->slug().'-field-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make($this->title()),
                    Text::make(__('workbench.pages.fields.'.$this->slug().'.description')),
                    $form,
                ]),
        ]);
    }
}
