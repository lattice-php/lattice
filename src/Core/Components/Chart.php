<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Core\Values\ChartSeries;

#[AsComponent('chart')]
class Chart extends Component
{
    public ?string $title = null;

    public ?string $description = null;

    /**
     * @var array<int, array<string, mixed>>
     */
    public array $data = [];

    /**
     * @var array<int, ChartSeries>
     */
    public array $series = [];

    public ?string $categoryKey = null;

    public int $height = 320;

    public bool $legend = true;

    public bool $tooltip = true;

    public bool $grid = true;

    public bool $xAxis = true;

    public bool $yAxis = true;

    public static function make(?string $title = null, ?string $key = null): static
    {
        $chart = new static($key);
        $chart->title = $title;

        return $chart;
    }

    public function description(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    /**
     * @param  array<int, array<string, mixed>>  $data
     */
    public function data(array $data): static
    {
        $this->data = array_values($data);

        return $this;
    }

    public function categoryKey(?string $key): static
    {
        $this->categoryKey = $key;

        return $this;
    }

    public function height(int $height): static
    {
        $this->height = $height;

        return $this;
    }

    public function legend(bool $legend = true): static
    {
        $this->legend = $legend;

        return $this;
    }

    public function tooltip(bool $tooltip = true): static
    {
        $this->tooltip = $tooltip;

        return $this;
    }

    public function grid(bool $grid = true): static
    {
        $this->grid = $grid;

        return $this;
    }

    public function xAxis(bool $xAxis = true): static
    {
        $this->xAxis = $xAxis;

        return $this;
    }

    public function yAxis(bool $yAxis = true): static
    {
        $this->yAxis = $yAxis;

        return $this;
    }

    public function line(string $dataKey, ?string $name = null, ?string $color = null): static
    {
        return $this->addSeries(ChartSeries::line($dataKey, $name, $color));
    }

    public function bar(string $dataKey, ?string $name = null, ?string $color = null, ?string $stackId = null): static
    {
        return $this->addSeries(ChartSeries::bar($dataKey, $name, $color, $stackId));
    }

    public function area(string $dataKey, ?string $name = null, ?string $color = null, ?string $stackId = null): static
    {
        return $this->addSeries(ChartSeries::area($dataKey, $name, $color, $stackId));
    }

    public function pie(string $dataKey, ?string $nameKey = null, ?string $name = null, ?string $color = null): static
    {
        return $this->addSeries(ChartSeries::pie($dataKey, $nameKey, $name, $color));
    }

    /**
     * @param  array<int, ChartSeries>  $series
     */
    public function series(array $series): static
    {
        $this->series = array_values($series);

        return $this;
    }

    private function addSeries(ChartSeries $series): static
    {
        $this->series[] = $series;

        return $this;
    }
}
