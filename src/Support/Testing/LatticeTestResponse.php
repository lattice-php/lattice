<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\Testing;

use BackedEnum;
use Illuminate\Testing\TestResponse;
use Lattice\Lattice\Effects\Builtin\OpenModal;
use Lattice\Lattice\Effects\Builtin\Redirect;
use Lattice\Lattice\Effects\Builtin\ReloadComponent;
use Lattice\Lattice\Effects\Builtin\ReloadPage;
use Lattice\Lattice\Effects\Builtin\Toast;
use Lattice\Lattice\Effects\Effect;
use Lattice\Lattice\Support\Wire;
use Lattice\Lattice\Ui\Enums\Variant;
use PHPUnit\Framework\Assert;
use Symfony\Component\HttpFoundation\Response;

/**
 * @template TResponse of Response
 *
 * @extends TestResponse<TResponse>
 */
final class LatticeTestResponse extends TestResponse
{
    public function assertReloadsComponent(string $component): static
    {
        return $this->assertEffect(new ReloadComponent($component));
    }

    public function assertRedirectsTo(string $url): static
    {
        return $this->assertEffect(new Redirect($url));
    }

    /**
     * @param  array<string, mixed>|string  $parameters
     */
    public function assertRedirectsToRoute(BackedEnum|string $route, array|string $parameters = []): static
    {
        $name = Wire::scalar($route);

        return $this->assertRedirectsTo(to_route($name, $parameters)->getTargetUrl());
    }

    public function assertToast(Variant $variant, ?string $message = null): static
    {
        $props = ['variant' => $variant->value];

        if ($message !== null) {
            $props['message'] = $message;
        }

        return $this->assertEffect(Toast::make($message ?? '', $variant), $props);
    }

    public function assertOpensModal(string $modal): static
    {
        return $this->assertEffect(new OpenModal($modal));
    }

    public function assertReloadsPage(): static
    {
        return $this->assertEffect(new ReloadPage);
    }

    public function assertNoEffects(): static
    {
        $effects = $this->effects();

        Assert::assertSame([], $effects, sprintf(
            'Expected no Lattice effects. Received effects: %s.',
            json_encode($effects, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES),
        ));

        return $this;
    }

    /**
     * @param  array<string, mixed>|null  $props
     */
    private function assertEffect(Effect $expected, ?array $props = null): static
    {
        $wire = Wire::toArray($expected);
        $expectedProps = $props ?? ($wire['props'] ?? []);

        Assert::assertIsArray($expectedProps);

        $effects = $this->effects();

        foreach ($effects as $effect) {
            if ($this->matchesEffect($effect, $expected->wireType(), $expectedProps)) {
                return $this;
            }
        }

        Assert::fail(sprintf(
            'Expected Lattice effect [%s] with props %s. Received effects: %s.',
            $expected->wireType(),
            json_encode($expectedProps, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES),
            json_encode($effects, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES),
        ));
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function effects(): array
    {
        $effects = $this->json('effects');

        Assert::assertIsArray($effects, 'Expected the Lattice response [effects] value to be an array.');

        foreach ($effects as $effect) {
            Assert::assertIsArray($effect, 'Expected every Lattice response effect to be an array.');
        }

        return array_values($effects);
    }

    /**
     * @param  array<string, mixed>  $effect
     * @param  array<string, mixed>  $expectedProps
     */
    private function matchesEffect(array $effect, string $expectedType, array $expectedProps): bool
    {
        if (($effect['type'] ?? null) !== $expectedType) {
            return false;
        }

        $actualProps = $effect['props'] ?? null;

        if (! is_array($actualProps)) {
            return false;
        }

        return array_all(
            $expectedProps,
            fn (mixed $value, int|string $key): bool => array_key_exists($key, $actualProps)
                && $actualProps[$key] === $value,
        );
    }
}
