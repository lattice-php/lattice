<?php
declare(strict_types=1);

namespace Lattice\Ui\Components;

use InvalidArgumentException;
use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Components\Concerns\HasPrimaryBinding;
use Lattice\Ui\Concerns\HasCopyable;
use Lattice\Ui\Enums\CodeBlockLanguage;

#[AsComponent('code-block')]
class CodeBlock extends Component
{
    use HasCopyable;
    use HasPrimaryBinding;

    public string $code = '';

    public CodeBlockLanguage $language = CodeBlockLanguage::Text;

    public bool $lineNumbers = false;

    public ?int $maxHeight = null;

    public bool $wrap = false;

    public static function make(string $code, ?string $key = null): static
    {
        $component = new static($key);
        $component->code = $code;

        return $component;
    }

    public function language(CodeBlockLanguage $language): static
    {
        $this->language = $language;

        return $this;
    }

    public function lineNumbers(bool $lineNumbers = true): static
    {
        $this->lineNumbers = $lineNumbers;

        return $this;
    }

    public function maxHeight(?int $maxHeight): static
    {
        if ($maxHeight !== null && $maxHeight <= 0) {
            throw new InvalidArgumentException('Code block maximum height must be greater than zero.');
        }

        $this->maxHeight = $maxHeight;

        return $this;
    }

    public function wrap(bool $wrap = true): static
    {
        $this->wrap = $wrap;

        return $this;
    }

    protected static function primaryBindableProp(): string
    {
        return 'code';
    }
}
