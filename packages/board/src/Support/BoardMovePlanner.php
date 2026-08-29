<?php
declare(strict_types=1);

namespace Lattice\Board\Support;

/**
 * Plans a board moveAction payload ({cardId, columnKey, position}) against
 * the current placements of one board. The plan holds only the placements
 * that must change, with contiguous zero-based positions in both the source
 * and the destination column, and is null when a structural guard fails:
 * unknown card, or a destination column that is not one of the board's
 * columns. The consuming application persists the plan inside its own
 * transaction and applies its own domain rules — the planner never writes
 * anything.
 */
final class BoardMovePlanner
{
    private function __construct() {}

    /**
     * @param  iterable<CardPlacement>  $placements
     * @param  list<string>  $columnKeys
     * @return list<CardPlacement>|null
     */
    public static function plan(
        iterable $placements,
        array $columnKeys,
        int|string $cardId,
        string $columnKey,
        int $position,
    ): ?array {
        $cards = [];

        foreach ($placements as $placement) {
            $cards[self::key($placement->id)] = $placement;
        }

        $movedKey = self::key($cardId);
        $moved = $cards[$movedKey] ?? null;

        if (! $moved instanceof CardPlacement) {
            return null;
        }

        if (! in_array($columnKey, $columnKeys, true)) {
            return null;
        }

        $sourceCards = self::orderedColumnCards($cards, $moved->columnKey, $movedKey);

        if ($moved->columnKey === $columnKey) {
            $destinationCards = $sourceCards;
            $sourceCards = [];
        } else {
            $destinationCards = self::orderedColumnCards($cards, $columnKey, $movedKey);
        }

        array_splice(
            $destinationCards,
            min(max($position, 0), count($destinationCards)),
            0,
            [$moved],
        );

        return [
            ...self::resequenced($sourceCards, $moved->columnKey),
            ...self::resequenced($destinationCards, $columnKey),
        ];
    }

    /**
     * String identity so a JSON wire id ("5") matches an integer primary
     * key (5) while UUID and ULID ids compare untouched.
     */
    private static function key(int|string $id): string
    {
        return (string) $id;
    }

    /**
     * @param  array<string, CardPlacement>  $cards
     * @return list<CardPlacement>
     */
    private static function orderedColumnCards(array $cards, string $columnKey, string $movedKey): array
    {
        $columnCards = array_values(array_filter(
            $cards,
            fn (CardPlacement $card): bool => self::key($card->id) !== $movedKey
                && $card->columnKey === $columnKey,
        ));

        usort(
            $columnCards,
            fn (CardPlacement $a, CardPlacement $b): int => $a->position <=> $b->position
                ?: self::key($a->id) <=> self::key($b->id),
        );

        return $columnCards;
    }

    /**
     * @param  list<CardPlacement>  $cards
     * @return list<CardPlacement>
     */
    private static function resequenced(array $cards, string $columnKey): array
    {
        $changed = [];

        foreach ($cards as $position => $card) {
            if ($card->position !== $position || $card->columnKey !== $columnKey) {
                $changed[] = new CardPlacement($card->id, $columnKey, $position);
            }
        }

        return $changed;
    }
}
