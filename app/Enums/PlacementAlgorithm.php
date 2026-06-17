<?php

namespace App\Enums;

enum PlacementAlgorithm: string
{
    case GlobalBalance = 'global_balance';

    public function label(): string
    {
        return match ($this) {
            self::GlobalBalance => 'Global Balance',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::GlobalBalance => 'Distributes students across all active classes by quota, gender balance, and race balance.',
        };
    }

    /**
     * @return array<int, array{key: string, label: string, description: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $algorithm) => [
                'key' => $algorithm->value,
                'label' => $algorithm->label(),
                'description' => $algorithm->description(),
            ],
            self::cases()
        );
    }

    /**
     * @return array<int, string>
     */
    public static function keys(): array
    {
        return array_map(fn (self $algorithm) => $algorithm->value, self::cases());
    }
}
