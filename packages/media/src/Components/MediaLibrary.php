<?php
declare(strict_types=1);

namespace Lattice\Media\Components;

use Lattice\Actions\Components\Action;
use Lattice\Core\Attributes\AsComponent;
use Lattice\Media\Actions\DeleteMediaAction;
use Lattice\Media\Actions\UpdateMediaAction;
use Lattice\Media\Actions\UploadMediaAction;
use Lattice\Media\Tables\MediaTable;
use Lattice\Table\Components\Table;
use Lattice\Ui\Components\ContainerComponent;
use Stringable;

#[AsComponent('media.library')]
final class MediaLibrary extends ContainerComponent
{
    public bool $picker = false;

    public ?string $accept = null;

    public bool $signed = false;

    protected ?string $disk = null;

    /** @var list<string> */
    protected array $uploadRules = [];

    public static function make(string $key = 'media-library'): static
    {
        $library = new self($key);
        $library->signed = (bool) config('media.signed_uploads');
        $library->accept = app(UploadMediaAction::class)->field()->accept;

        return $library;
    }

    public function picker(bool $picker = true): static
    {
        $this->picker = $picker;

        return $this->schema([]);
    }

    public function accept(string $accept): static
    {
        $this->accept = $accept;

        return $this->schema([]);
    }

    public function signedUpload(bool $signed = true): static
    {
        $this->signed = $signed;

        return $this->schema([]);
    }

    public function disk(string $disk): static
    {
        $this->disk = $disk;

        return $this->schema([]);
    }

    /**
     * Validation rules every uploaded file must pass, on top of the accepted
     * types and the size cap.
     *
     * The upload context is sealed as JSON, so rules travel as strings: pass
     * string rules (`'dimensions:max_width=4000'`) or rule objects that
     * stringify (`Rule::dimensions()->maxWidth(4000)`), never closures or
     * custom rule classes. `dimensions` needs the bytes, so it only applies to
     * multipart uploads — see the signed-upload caveat in the README.
     *
     * @param  array<int, string|Stringable>  $rules
     */
    public function uploadRules(array $rules): static
    {
        $this->uploadRules = array_map(strval(...), $rules);

        return $this->schema([]);
    }

    /**
     * Composed on first resolve, not in make(), so the fluents run before the
     * upload settings are sealed into the upload action's context. The wire
     * props and that context must always agree — the client picks its upload
     * flow from `signed`, and a mismatch fails validation — so every fluent
     * that feeds the context clears the schema (the trait's own cache
     * invalidation) and the next resolve reseals it.
     */
    #[\Override]
    protected function resolvedChildren(): array
    {
        if ($this->children === []) {
            $children = [
                Table::use(MediaTable::class),
                Action::use(UploadMediaAction::class, $this->uploadContext())->key('media-upload'),
            ];

            if (! $this->picker) {
                $children[] = Action::use(UpdateMediaAction::class)->key('media-update');
                $children[] = Action::use(DeleteMediaAction::class)->key('media-delete');
            }

            $this->schema($children);
        }

        return parent::resolvedChildren();
    }

    /**
     * @return array<string, mixed>
     */
    private function uploadContext(): array
    {
        $context = ['signed' => $this->signed];

        if ($this->disk !== null) {
            $context['disk'] = $this->disk;
        }

        if ($this->accept !== null) {
            $context['accepted_types'] = array_values(array_filter(
                array_map(trim(...), explode(',', $this->accept)),
            ));
        }

        if ($this->uploadRules !== []) {
            $context['upload_rules'] = $this->uploadRules;
        }

        return $context;
    }
}
