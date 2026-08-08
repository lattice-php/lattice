<?php
declare(strict_types=1);

use Lattice\Ui\Components\Component;

enum WirePropsProbeStatus: string
{
    case Active = 'active';
}

it('collects public typed properties including nulls and empty arrays, skipping builder-only state', function (): void {
    $component = new class extends Component
    {
        public string $label = 'Hi';

        public ?string $variant = null;

        public WirePropsProbeStatus $status = WirePropsProbeStatus::Active;

        /** @var array<int, string> */
        public array $tags = [];

        protected string $builderOnly = 'x';

        protected function type(): string
        {
            return 'probe';
        }

        /** @return array<string, mixed> */
        public function exposeWireProps(): array
        {
            return $this->wireProps();
        }
    };

    expect($component->exposeWireProps())->toBe([
        'label' => 'Hi',
        'variant' => null,
        'status' => 'active',
        'tags' => [],
    ]);
});
