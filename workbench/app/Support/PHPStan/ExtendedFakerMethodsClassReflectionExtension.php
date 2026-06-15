<?php

declare(strict_types=1);

namespace Workbench\App\Support\PHPStan;

use Bambamboole\ExtendedFaker\Dto\ProductDto;
use Faker\Generator;
use Faker\UniqueGenerator;
use PHPStan\Reflection\ClassMemberReflection;
use PHPStan\Reflection\ClassReflection;
use PHPStan\Reflection\FunctionVariant;
use PHPStan\Reflection\MethodReflection;
use PHPStan\Reflection\MethodsClassReflectionExtension;
use PHPStan\Reflection\ParameterReflection;
use PHPStan\Reflection\ParametersAcceptor;
use PHPStan\Reflection\PassedByReference;
use PHPStan\TrinaryLogic;
use PHPStan\Type\Generic\TemplateTypeMap;
use PHPStan\Type\NullType;
use PHPStan\Type\ObjectType;
use PHPStan\Type\StringType;
use PHPStan\Type\Type;
use PHPStan\Type\UnionType;

final class ExtendedFakerMethodsClassReflectionExtension implements MethodsClassReflectionExtension
{
    public function hasMethod(ClassReflection $classReflection, string $methodName): bool
    {
        return $methodName === 'product'
            && ($classReflection->is(Generator::class) || $classReflection->is(UniqueGenerator::class));
    }

    public function getMethod(ClassReflection $classReflection, string $methodName): MethodReflection
    {
        return new ExtendedFakerProductMethodReflection($classReflection, $methodName);
    }
}

final class ExtendedFakerProductMethodReflection implements MethodReflection
{
    public function __construct(
        private ClassReflection $classReflection,
        private string $methodName,
    ) {}

    public function getDeclaringClass(): ClassReflection
    {
        return $this->classReflection;
    }

    public function isStatic(): bool
    {
        return false;
    }

    public function isPrivate(): bool
    {
        return false;
    }

    public function isPublic(): bool
    {
        return true;
    }

    public function getDocComment(): ?string
    {
        return null;
    }

    public function getName(): string
    {
        return $this->methodName;
    }

    public function getPrototype(): ClassMemberReflection
    {
        return $this;
    }

    /**
     * @return list<ParametersAcceptor>
     */
    public function getVariants(): array
    {
        return [
            new FunctionVariant(
                TemplateTypeMap::createEmpty(),
                TemplateTypeMap::createEmpty(),
                [new ExtendedFakerProductIdentifierParameterReflection],
                false,
                new ObjectType(ProductDto::class),
            ),
        ];
    }

    public function isDeprecated(): TrinaryLogic
    {
        return TrinaryLogic::createNo();
    }

    public function getDeprecatedDescription(): ?string
    {
        return null;
    }

    public function isFinal(): TrinaryLogic
    {
        return TrinaryLogic::createNo();
    }

    public function isInternal(): TrinaryLogic
    {
        return TrinaryLogic::createNo();
    }

    public function getThrowType(): ?Type
    {
        return null;
    }

    public function hasSideEffects(): TrinaryLogic
    {
        return TrinaryLogic::createMaybe();
    }
}

final class ExtendedFakerProductIdentifierParameterReflection implements ParameterReflection
{
    public function getName(): string
    {
        return 'identifier';
    }

    public function isOptional(): bool
    {
        return true;
    }

    public function getType(): Type
    {
        return new UnionType([new StringType, new NullType]);
    }

    public function passedByReference(): PassedByReference
    {
        return PassedByReference::createNo();
    }

    public function isVariadic(): bool
    {
        return false;
    }

    public function getDefaultValue(): Type
    {
        return new NullType;
    }
}
