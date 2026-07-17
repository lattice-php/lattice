<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Attributes\AsAction;
use Lattice\Lattice\Ui\Enums\ButtonVariant;
use Workbench\App\Models\User;

#[AsAction('workbench.locale.set')]
class SetLocaleAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->variant(ButtonVariant::Ghost);
    }

    public function handle(Request $request): ActionResult
    {
        $locale = $this->context('locale');
        $configured = config('lattice.i18n.locales', []);
        $locales = is_array($configured)
            ? array_values(array_filter($configured, is_string(...)))
            : [];

        if (! is_string($locale) || ! in_array($locale, $locales, true)) {
            return ActionResult::success();
        }

        $user = $request->user();

        if ($user instanceof User) {
            $user->update(['locale' => $locale]);
        }

        return ActionResult::success()->localeChange($locale);
    }
}
