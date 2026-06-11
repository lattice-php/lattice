<?php

declare(strict_types=1);

use Illuminate\Support\Facades\File;

use function Pest\Laravel\artisan;

beforeEach(function () {
    File::ensureDirectoryExists(resource_path('js/lattice'));
    File::put(resource_path('js/lattice/plugin.ts'),
        "import { createPlugin } from \"@lattice-php/lattice\";\n\nexport const appPlugin = createPlugin({\n  name: \"app\",\n  components: {},\n});\n");
});

afterEach(function () {
    File::deleteDirectory(app_path('Components'));
    File::deleteDirectory(resource_path('js/lattice'));
});

it('scaffolds a component class with the Component attribute and registers it', function () {
    artisan('lattice:component', ['name' => 'Rating'])->assertSuccessful();

    $php = File::get(app_path('Components/Rating.php'));
    expect($php)
        ->toContain('namespace App\\Components;')
        ->toContain('use Lattice\\Lattice\\Attributes;')
        ->toContain("#[Attributes\\Component('rating')]")
        ->toContain('class Rating extends Component');

    expect(File::get(resource_path('js/lattice/components/rating.tsx')))
        ->toContain('RendererComponent<"rating">');

    expect(File::get(resource_path('js/lattice/plugin.ts')))
        ->toContain('import { RatingComponent } from "./components/rating";')
        ->toContain('"rating": eagerComponent(RatingComponent)');
});

it('honors a --type override', function () {
    artisan('lattice:component', ['name' => 'Stars', '--type' => 'rating.stars'])->assertSuccessful();

    expect(File::get(app_path('Components/Stars.php')))->toContain("#[Attributes\\Component('rating.stars')]");
});
