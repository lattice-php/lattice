<?php
declare(strict_types=1);

namespace Lattice\Core;

use BackedEnum;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Lattice\Core\Contracts\Authorizable;
use Lattice\Core\Contracts\DeclaresGate;
use Lattice\Core\Contracts\ResolvesGateSubject;
use Lattice\Core\Support\Wire;
use Spatie\Attributes\Attributes;

/**
 * Where a gate is composed and applied. The `can` declared on a class attribute
 * is checked here rather than on the subject, so an authorize() override can
 * narrow what `can` declared but has no way to widen it.
 *
 * The two consequences are deliberately different and both live here: an
 * endpoint aborts, while a definition that fails at render time is hidden
 * instead — see DefinitionRegistry::gatedComponent().
 *
 * A declared `on` names the context key whose resolved value the gate checks
 * against, via {@see ResolvesGateSubject}. A key that resolves to nothing
 * denies outright — a missing subject is never treated as a subject-less
 * check.
 */
final class Authorization
{
    public static function passes(Authorizable $subject, Request $request): bool
    {
        $declared = self::declaredGate($subject);
        $on = $declared?->on();

        $gateSubject = null;

        if ($on !== null) {
            $gateSubject = $subject instanceof ResolvesGateSubject ? $subject->gateSubject($on) : null;

            if ($gateSubject === null) {
                return false;
            }
        }

        return self::allows($declared?->can() ?? [], $request, $gateSubject)
            && $subject->authorize($request);
    }

    public static function ensure(Authorizable $subject, Request $request): void
    {
        abort_unless(self::passes($subject, $request), 403);
    }

    /**
     * The declared abilities as gate names: a `can` spelled as a single
     * ability or a list, each either a string or a backed-enum case.
     *
     * @param  string|BackedEnum|array<int, string|BackedEnum>  $can
     * @return array<int, string>
     */
    public static function abilities(string|BackedEnum|array $can): array
    {
        return array_map(Wire::scalar(...), is_array($can) ? array_values($can) : [$can]);
    }

    /**
     * @param  array<int, string>  $can
     */
    public static function allows(array $can, Request $request, ?object $subject = null): bool
    {
        return $can === [] || Gate::forUser($request->user())->check($can, $subject === null ? [] : [$subject]);
    }

    private static function declaredGate(Authorizable $subject): ?DeclaresGate
    {
        return Attributes::get($subject, DeclaresGate::class);
    }
}
