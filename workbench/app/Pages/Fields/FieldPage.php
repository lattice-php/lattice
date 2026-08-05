<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Fields;

use Lattice\Form\Components\Form;
use Lattice\Form\FormDefinition;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\Enums\HttpMethod;
use Lattice\Ui\PageSchema;
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
