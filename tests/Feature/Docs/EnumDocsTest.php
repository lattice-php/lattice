<?php
declare(strict_types=1);

use Lattice\Lattice\Ui\Enums\Icon;

/**
 * The enums reference page renders its case lists from this generated file
 * instead of a hand-maintained table, so the documented cases can never drift
 * from the real enums. `Icon` is excluded: its cases are the full icon catalog,
 * generated from the bundled SVGs rather than documented case by case.
 *
 * @return array<class-string, array{name: string, namespace: string, cases: list<array{name: string, value: string|int|null}>}>
 */
function generateEnumReference(): array
{
    $root = dirname(__DIR__, 3);
    $files = glob($root.'/src/*/Enums/*.php') ?: [];

    $enums = [];

    foreach ($files as $file) {
        $relative = substr($file, strlen($root.'/src/'), -strlen('.php'));
        $class = 'Lattice\\Lattice\\'.str_replace('/', '\\', $relative);

        if ($class === Icon::class || ! enum_exists($class)) {
            continue;
        }

        $reflection = new ReflectionEnum($class);

        $cases = array_map(fn (ReflectionEnumUnitCase $case): array => [
            'name' => $case->getName(),
            'value' => $case instanceof ReflectionEnumBackedCase ? $case->getBackingValue() : null,
        ], $reflection->getCases());

        $enums[$class] = [
            'name' => $reflection->getShortName(),
            'namespace' => $reflection->getNamespaceName(),
            'cases' => $cases,
        ];
    }

    ksort($enums);

    return $enums;
}

describe('docs fixtures', function (): void {
    it('matches the enum reference fixture the docs page renders from', function (): void {
        $enums = generateEnumReference();

        assertFixtureMatches('enums', $enums);
    });
});

describe('enum reference', function (): void {
    it('lists every backed enum on the reference page so none can be silently missed', function (): void {
        $page = file_get_contents(dirname(__DIR__, 3).'/docs/content/docs/advanced/enums.mdx');

        foreach (generateEnumReference() as $enum) {
            expect($page)->toContain($enum['name']);
        }
    });
});
