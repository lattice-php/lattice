<?php
declare(strict_types=1);

use Lattice\Core\Attributes\AsFragment;
use Lattice\Core\Facades\Lattice;
use Lattice\Fragments\Components\Fragment as FragmentComponent;
use Lattice\Fragments\FragmentDefinition;
use Lattice\Ui\Components\Text;
use Lattice\Ui\PageSchema;

use function Pest\Laravel\getJson;

test('registered fragments serialize lazy endpoints and return component schemas', function (): void {
    Lattice::fragments([WorkbenchTwoFactorSetupFragment::class]);

    $fragment = wire(FragmentComponent::lazy(WorkbenchTwoFactorSetupFragment::class));
    $ref = $this->latticeRef($fragment);

    expect($fragment)
        ->toMatchArray([
            'type' => 'fragment',
            'id' => 'workbench.two-factor-setup',
            'props' => [
                'endpoint' => '/lattice/fragments/workbench.two-factor-setup',
                'lazy' => true,
                'ref' => $ref,
                'size' => 'md',
            ],
        ]);

    getJson('/lattice/fragments/workbench.two-factor-setup')
        ->assertForbidden();

    getJson('/lattice/fragments/workbench.two-factor-setup', $this->latticeHeaders('tampered'))
        ->assertForbidden();

    $this->latticeGet('/lattice/fragments/workbench.two-factor-setup', $ref)
        ->assertOk()
        ->assertJsonPath('schema.0.type', 'text')
        ->assertJsonPath('schema.0.props.text', 'Authenticator setup loaded.');
});

#[AsFragment('workbench.two-factor-setup')]
final class WorkbenchTwoFactorSetupFragment extends FragmentDefinition
{
    public function schema(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Authenticator setup loaded.'));
    }
}
