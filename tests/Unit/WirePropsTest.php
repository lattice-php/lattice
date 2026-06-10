<?php

declare(strict_types=1);

use Lattice\Lattice\Core\Components\Component;

enum WirePropsProbeStatus: string
{
    case Active = 'active';
}

it('collects public typed properties, skipping nulls and builder-only state', function (): void {
    $component = new class extends Component
    {
        public string $label = 'Hi';

        public ?string $variant = null;

        public WirePropsProbeStatus $status = WirePropsProbeStatus::Active;

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
        'status' => 'active',
    ]);
});

it('skips empty-array public properties', function (): void {
    $component = new class extends Component
    {
        /** @var array<int, string> */
        public array $tags = [];

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

    expect($component->exposeWireProps())->not->toHaveKey('tags');
});
