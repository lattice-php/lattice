<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Ui\Components\Concerns\HasPrimaryBinding;
use Lattice\Lattice\Ui\Concerns\HasCopyable;
use Lattice\Lattice\Ui\Enums\CodeBlockLanguage;

#[AsComponent('code-block')]
class CodeBlock extends Component
{
    use HasCopyable;
    use HasPrimaryBinding;

    public string $code = '';

    public CodeBlockLanguage $language = CodeBlockLanguage::Text;

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
