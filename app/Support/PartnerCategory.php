<?php

namespace App\Support;

class PartnerCategory
{
    /**
     * Pemetaan bidang industri => kategori partner (daftar klien 2026-09-23).
     * Industri yang tidak terdaftar (termasuk "Lain-Lain" dan input bebas) => DEFAULT.
     */
    public const MAP = [
        'Elektrikal' => 'Elektronik & Gadget',
        'Elektronik' => 'Elektronik & Gadget',
        'F&B - Baking' => 'F&B',
        'F&B - Coffee Shop' => 'F&B',
        'F&B - Supplier' => 'F&B',
        'F&B - Resto/Depot' => 'F&B',
        'Salon' => 'Kecantikan',
        'Farmasi' => 'Kesehatan',
        'Kesehatan' => 'Kesehatan',
        'Olahraga' => 'Olahraga',
        'Otomotif - Roda Dua & Tiga' => 'Otomotif',
        'Otomotif - Parts & Aksesoris' => 'Otomotif',
        'Otomotif - Roda Empat' => 'Otomotif',
        'Arsitektur' => 'Pembangunan',
        'Konstruksi - Interior' => 'Pembangunan',
        'Konstruksi - Exterior' => 'Pembangunan',
        'Real Estate' => 'Real Estate',
        'Hotel & Villa' => 'Real Estate',
        'Penyewaan & Sewa Guna' => 'Real Estate',
        'Perdagangan Besar/Eceran' => 'Supplier',
    ];

    public const DEFAULT = 'Lain-lain';

    /** Semua pilihan kategori partner. */
    public const OPTIONS = [
        'Elektronik & Gadget',
        'F&B',
        'Kecantikan',
        'Kesehatan',
        'Olahraga',
        'Otomotif',
        'Pembangunan',
        'Real Estate',
        'Supplier',
        'Lain-lain',
    ];

    /**
     * Tentukan kategori partner dari daftar bidang industri terpilih.
     * Hasil pertama yang bukan DEFAULT menang; jika semuanya DEFAULT => DEFAULT.
     *
     * @param  array<int, string>  $industries
     */
    public static function fromIndustries(array $industries): string
    {
        foreach ($industries as $industry) {
            $category = self::MAP[trim((string) $industry)] ?? self::DEFAULT;

            if ($category !== self::DEFAULT) {
                return $category;
            }
        }

        return self::DEFAULT;
    }
}
