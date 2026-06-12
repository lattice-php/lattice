<?php

declare(strict_types=1);

namespace Workbench\App\Console\Commands;

use Illuminate\Console\Command;
use Lattice\Lattice\Actions\Contracts\Effect;
use Lattice\Lattice\Attributes\Effect as EffectAttribute;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Support\TypeScript\ComponentDiscovery;
use Lattice\Lattice\Support\TypeScript\ComponentTransformer;
use Lattice\Lattice\Support\TypeScript\DiscoveredComponent;
use Lattice\Lattice\Support\TypeScript\OxfmtFormatter;
use Lattice\Lattice\Support\TypeScript\TypeScriptGenerator;
use Spatie\Attributes\Attributes;
use Spatie\StructureDiscoverer\Discover;
use Spatie\TypeScriptTransformer\Writers\FlatModuleWriter;
use Workbench\App\Support\TypeScript\EnumTransformer;
use Workbench\App\Support\TypeScript\HttpMethodTransformer;
use Workbench\App\Support\TypeScript\MarkedTypeDiscovery;
use Workbench\App\Support\TypeScript\NodesProvider;
use Workbench\App\Support\TypeScript\ValueObjectTransformer;

final class GenerateInternalTypesCommand extends Command
{
    /**
     * The component domains, in output order, mapped to their generated node-alias
     * name. This is the one declared, ordered piece of static config: discovery
     * supplies the components, but the emission order and the (singular) node names
     * are meaningful and not derivable from the (plural) namespace segments.
     */
    private const DOMAIN_NODES = [
        'Core' => 'CoreNode',
        'Actions' => 'ActionNode',
        'Fragments' => 'FragmentNode',
        'Tables' => 'TableNode',
        'Layouts' => 'LayoutNode',
    ];

    protected $signature = 'lattice:internal-types';

    protected $description = "Regenerate Lattice's built-in TypeScript types (resources/js/types/generated.ts)";

    public function handle(TypeScriptGenerator $generator): int
    {
        $packageRoot = dirname(__DIR__, 4);
        $src = $packageRoot.'/src';

        $effects = $this->discoverEffects($src.'/Actions/Effects');
        $marked = (new MarkedTypeDiscovery)->discover($src);

        $discovered = (new ComponentDiscovery)->discover($src);

        $formFields = $this->buildFormFields($discovered);
        $domainNodes = $this->buildDomainNodes($discovered);

        $generator->generate(
            [$src],
            [
                new HttpMethodTransformer,
                new EnumTransformer($marked['enums']),
                new ValueObjectTransformer([
                    ...$marked['valueObjects'],
                    ...array_keys($effects),
                ]),
                new ComponentTransformer([
                    ...array_keys($formFields),
                    Form::class,
                    ...$this->componentClasses($domainNodes),
                ]),
            ],
            [
                new NodesProvider(
                    $formFields,
                    Form::class,
                    $domainNodes,
                    'form',
                    Effect::class,
                    $effects,
                ),
            ],
            new FlatModuleWriter('generated.ts'),
            $packageRoot.'/resources/js/types',
            new OxfmtFormatter,
        );

        $this->components->info('Regenerated built-in TypeScript types.');

        return self::SUCCESS;
    }

    /**
     * Effect value objects keyed by class-string, valued by the wire type from
     * their #[Effect] attribute. Drives the allow-list and the generated union.
     *
     * @return array<class-string, string>
     */
    private function discoverEffects(string $path): array
    {
        /** @var list<class-string> $classes */
        $classes = (new Discover(directories: [$path]))->classes()->get();

        $effects = [];

        foreach ($classes as $class) {
            $effect = Attributes::get($class, EffectAttribute::class);

            if ($effect === null) {
                continue;
            }

            $effects[$class] = $effect->type->value;
        }

        return $effects;
    }

    /**
     * @param  list<DiscoveredComponent>  $discovered
     * @return array<class-string, string>
     */
    private function buildFormFields(array $discovered): array
    {
        $fields = array_filter(
            $discovered,
            fn (DiscoveredComponent $dc): bool => $dc->domain === 'Forms' && $dc->class !== Form::class,
        );

        usort($fields, fn (DiscoveredComponent $a, DiscoveredComponent $b): int => $a->type <=> $b->type);

        return array_column(
            array_map(fn (DiscoveredComponent $dc): array => [$dc->class, $dc->type], $fields),
            1,
            0,
        );
    }

    /**
     * The components for each domain, keyed by node-alias name in DOMAIN_NODES order.
     *
     * @param  list<DiscoveredComponent>  $discovered
     * @return array<string, array<class-string, array{type: string, container?: bool, interactive?: bool}>>
     */
    private function buildDomainNodes(array $discovered): array
    {
        $domainNodes = [];

        foreach (self::DOMAIN_NODES as $domain => $nodeName) {
            $domainNodes[$nodeName] = $this->buildBucket($discovered, $domain);
        }

        return $domainNodes;
    }

    /**
     * @param  list<DiscoveredComponent>  $discovered
     * @return array<class-string, array{type: string, container?: bool, interactive?: bool}>
     */
    private function buildBucket(array $discovered, string $domain): array
    {
        $components = array_filter(
            $discovered,
            fn (DiscoveredComponent $dc): bool => $dc->domain === $domain,
        );

        usort($components, fn (DiscoveredComponent $a, DiscoveredComponent $b): int => $a->type <=> $b->type);

        $result = [];

        foreach ($components as $dc) {
            $spec = ['type' => $dc->type];

            if ($dc->container) {
                $spec['container'] = true;
            }

            if ($dc->interactive) {
                $spec['interactive'] = true;
            }

            $result[$dc->class] = $spec;
        }

        return $result;
    }

    /**
     * Flatten the per-domain component class-strings into one allow-list.
     *
     * @param  array<string, array<class-string, array{type: string, container?: bool, interactive?: bool}>>  $domainNodes
     * @return list<class-string>
     */
    private function componentClasses(array $domainNodes): array
    {
        $classes = [];

        foreach ($domainNodes as $components) {
            $classes = [...$classes, ...array_keys($components)];
        }

        return $classes;
    }
}
