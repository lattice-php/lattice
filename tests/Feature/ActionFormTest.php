<?php

declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Attributes\Action;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Forms\Components\Textarea;

use function Pest\Laravel\postJson;

it('validates the embedded form and hands the data to handle', function (): void {
    Lattice::actions([RejectActionFixture::class]);
    $ref = componentRef(wire(ActionComponent::use(RejectActionFixture::class)));

    postJson('/lattice/actions/test.reject', ['reason' => 'spam'], latticeHeaders($ref))
        ->assertOk()
        ->assertJsonPath('ok', true)
        ->assertJsonPath('data.reason', 'spam');
});

it('rejects an invalid embedded form with a 422', function (): void {
    Lattice::actions([RejectActionFixture::class]);
    $ref = componentRef(wire(ActionComponent::use(RejectActionFixture::class)));

    postJson('/lattice/actions/test.reject', ['reason' => ''], latticeHeaders($ref))
        ->assertStatus(422)
        ->assertJsonValidationErrors('reason');
});

it('validates the embedded form precognitively without running handle', function (): void {
    Lattice::actions([RejectActionFixture::class]);
    $ref = componentRef(wire(ActionComponent::use(RejectActionFixture::class)));

    $precognition = array_merge(latticeHeaders($ref), [
        'Precognition' => 'true',
        'Precognition-Validate-Only' => 'reason',
    ]);

    postJson('/lattice/actions/test.reject', ['reason' => 'this reason is far too long'], $precognition)
        ->assertStatus(422)
        ->assertJsonValidationErrors('reason');

    postJson('/lattice/actions/test.reject', ['reason' => 'ok'], $precognition)
        ->assertNoContent();
});

#[Action('test.reject')]
class RejectActionFixture extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action
            ->label('Reject')
            ->method(HttpMethod::Post)
            ->form([
                Textarea::make('reason', 'Reason')->required()->rules(['max:10']),
            ]);
    }

    public function handle(Request $request): ActionResult
    {
        $data = $this->validate($request);

        return ActionResult::success(['reason' => $data['reason']]);
    }
}
