<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Core\Attributes\AsAction;
use Lattice\Ui\Enums\Emphasis;
use Workbench\App\Models\User;

#[AsAction('workbench.locale.set')]
class SetLocaleAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->emphasis(Emphasis::Ghost);
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
