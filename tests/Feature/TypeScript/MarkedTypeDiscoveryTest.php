<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Components\Card;
use Lattice\Lattice\Core\Enums\Align;
use Lattice\Lattice\Core\Enums\Variant;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Core\Values\ToastMessage;
use Workbench\App\Support\TypeScript\MarkedTypeDiscovery;

it('splits #[TypeScript]-marked classes into enums and value objects', function (): void {
    $result = (new MarkedTypeDiscovery)->discover(dirname(__DIR__, 3).'/src');

    expect($result['enums'])->toContain(Align::class)->toContain(Variant::class);
    expect($result['enums'])->not->toContain(Option::class);

    expect($result['valueObjects'])->toContain(Option::class)->toContain(ToastMessage::class);
    expect($result['valueObjects'])->not->toContain(Align::class);
});

it('excludes classes without the #[TypeScript] attribute', function (): void {
    $result = (new MarkedTypeDiscovery)->discover(dirname(__DIR__, 3).'/src');

    $all = [...$result['enums'], ...$result['valueObjects']];

    expect($all)->not->toContain(Card::class);
});

it('sorts each list deterministically by class-string', function (): void {
    $result = (new MarkedTypeDiscovery)->discover(dirname(__DIR__, 3).'/src');

    $sortedEnums = $result['enums'];
    sort($sortedEnums);
    $sortedValueObjects = $result['valueObjects'];
    sort($sortedValueObjects);

    expect($result['enums'])->toBe($sortedEnums)
        ->and($result['valueObjects'])->toBe($sortedValueObjects);
});

it('returns empty lists when the path does not exist', function (): void {
    expect((new MarkedTypeDiscovery)->discover('/no/such/path'))
        ->toBe(['enums' => [], 'valueObjects' => []]);
});
