<?php
declare(strict_types=1);

namespace Lattice\Core;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Lattice\Core\Contracts\Authorizable;
use Lattice\Core\Contracts\DeclaresGate;
use Spatie\Attributes\Attributes;

/**
 * Where a gate is composed and applied. The `can` declared on a class attribute
 * is checked here rather than on the subject, so an authorize() override can
 * narrow what `can` declared but has no way to widen it.
 *
 * The two consequences are deliberately different and both live here: an
 * endpoint aborts, while a definition that fails at render time is hidden
 * instead — see DefinitionRegistry::gatedComponent().
 */
final class Authorization
{
    public static function passes(Authorizable $subject, Request $request): bool
    {
        return self::allows(self::declaredGate($subject), $request)
            && $subject->authorize($request);
    }

    public static function ensure(Authorizable $subject, Request $request): void
    {
        abort_unless(self::passes($subject, $request), 403);
    }

    /**
     * @param  array<int, string>  $can
     */
    public static function allows(array $can, Request $request): bool
    {
        return $can === [] || Gate::forUser($request->user())->check($can);
    }

    /**
     * @return array<int, string>
     */
    private static function declaredGate(Authorizable $subject): array
    {
        return Attributes::get($subject, DeclaresGate::class)?->can() ?? [];
    }
}
