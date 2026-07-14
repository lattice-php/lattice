<?php
declare(strict_types=1);

namespace Workbench\App\Forms\Fields;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Forms\Components\DateInput;
use Lattice\Lattice\Forms\Components\DateTimeInput;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\Components\TimeInput;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Ui\Components\Tab;
use Lattice\Lattice\Ui\Components\Tabs;
use Lattice\Lattice\Ui\Enums\Orientation;
use Symfony\Component\HttpFoundation\Response;

#[AsForm('workbench.fields.date-time.form')]
class DateTimeFieldsForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form->schema([
            Tabs::make('date-time-variants')
                ->queryKey('type')
                ->orientation(Orientation::Vertical)
                ->defaultValue('date')
                ->schema([
                    Tab::make('date', __('workbench.fields.date-time.date'))->schema([
                        DateInput::make('due', __('workbench.forms.dependent.due-date'))
                            ->rules(['nullable', 'date']),
                        DateInput::make('birthday', __('workbench.forms.showcase.birthday'))
                            ->max('2026-01-01')
                            ->rules(['nullable', 'date']),
                    ]),
                    Tab::make('time', __('workbench.fields.date-time.time'))->schema([
                        TimeInput::make('meeting_time', __('workbench.forms.showcase.meeting-time'))
                            ->min('08:00')
                            ->max('18:00'),
                    ]),
                    Tab::make('datetime', __('workbench.fields.date-time.datetime'))->schema([
                        DateTimeInput::make('launch_at', __('workbench.forms.showcase.launch-at'))
                            ->convertTimeZone(),
                    ]),
                ]),
        ]);
    }

    public function handle(Request $request): Response
    {
        $this->validate($request);

        return redirect('/form/fields/date-time');
    }
}
