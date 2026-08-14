<?php
declare(strict_types=1);

namespace Lattice\Media\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Lattice\Media\Jobs\GenerateMediaConversions;
use Lattice\Media\Models\Media;

final class GenerateConversionsCommand extends Command
{
    protected $signature = 'media:conversions
        {--missing : Only queue media that is actually missing work}
        {--only= : Comma-separated conversion names, narrowing what --force drops and what --missing counts}
        {--force : Drop the targeted conversions first so a changed callback is adopted}
        {--id=* : Restrict the run to these media ids}';

    protected $description = 'Queue the media conversion job for the library, backfilling or regenerating derivatives.';

    public function handle(): int
    {
        $names = $this->targetedNames();
        $queued = 0;

        $this->query()->chunkById(100, function (Collection $chunk) use ($names, &$queued): void {
            /** @var Collection<int, Media> $chunk */
            foreach ($chunk as $media) {
                if ($this->option('missing') && ! $this->needsWork($media, $names)) {
                    continue;
                }

                if ($this->option('force')) {
                    $this->dropTargeted($media, $names);
                }

                GenerateMediaConversions::dispatch($media);
                $queued++;
            }
        });

        $this->components->info("Queued conversions for {$queued} media.");

        return self::SUCCESS;
    }

    /**
     * @return Builder<Media>
     */
    private function query(): Builder
    {
        $builder = Media::modelQuery()->whereIn('mime_type', Media::probeableMimeTypes());

        /** @var list<string> $ids */
        $ids = (array) $this->option('id');

        return $ids === [] ? $builder : $builder->whereKey($ids);
    }

    /**
     * The conversion names this run is about; empty means all of them.
     *
     * @return list<string>
     */
    private function targetedNames(): array
    {
        $only = $this->option('only');

        if (! is_string($only) || $only === '') {
            return [];
        }

        return array_values(array_filter(array_map(trim(...), explode(',', $only))));
    }

    /**
     * @param  list<string>  $names
     */
    private function needsWork(Media $media, array $names): bool
    {
        if ($media->width === null) {
            return true;
        }

        $generated = $media->conversions();
        $wanted = $names === [] ? array_keys($media->defaultConversions()) : $names;

        if (array_diff($wanted, array_keys($generated)) !== []) {
            return true;
        }

        return array_any(array_intersect_key($generated, array_flip($wanted)), fn (array $conversion): bool => ! isset($conversion['size']));
    }

    /**
     * Un-maps the targeted conversions so the job rebuilds them, deleting their
     * files on the way out: a callback whose output extension changed writes to
     * a different path, and the old object is unreachable once the map — the
     * only record of it — forgets it.
     *
     * @param  list<string>  $names
     */
    private function dropTargeted(Media $media, array $names): void
    {
        $generated = $media->conversions();
        $forget = array_intersect_key($generated, array_flip($names === [] ? array_keys($generated) : $names));

        if ($forget === []) {
            return;
        }

        Storage::disk($media->disk)->delete(array_column($forget, 'path'));
        $media->mergeMeta(['conversions' => array_diff_key($generated, $forget)]);
    }
}
