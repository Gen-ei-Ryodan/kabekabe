<?php

namespace App\Services\Import;

use Illuminate\Support\Str;
use OpenSpout\Reader\CSV\Reader as CsvReader;
use OpenSpout\Reader\ReaderInterface;
use OpenSpout\Reader\XLSX\Options as XlsxOptions;
use OpenSpout\Reader\XLSX\Reader as XlsxReader;

/**
 * Reads spreadsheets (.xlsx / .csv) into associative rows,
 * using the first non-empty row as the header line.
 */
class SpreadsheetRowReader
{
    /**
     * @return \Generator<int, array<string, string>>
     */
    public function rows(string $path): \Generator
    {
        $reader = $this->createReader($path);

        try {
            foreach ($reader->getSheetIterator() as $sheet) {
                $header = null;

                foreach ($sheet->getRowIterator() as $row) {
                    $values = array_map(
                        fn ($cell) => trim((string) ($cell->getValue() ?? '')),
                        iterator_to_array($row->getCells()),
                    );

                    if ($header === null) {
                        $header = array_map(fn (string $value): string => Str::snake(strtolower($value)), $values);

                        continue;
                    }

                    if (implode('', $values) === '') {
                        continue;
                    }

                    $record = [];

                    foreach ($header as $index => $key) {
                        if ($key !== '' && $key !== null) {
                            $record[$key] = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $values[$index] ?? '') ?? '';
                        }
                    }

                    yield $record;
                }

                break;
            }
        } finally {
            $reader->close();
        }
    }

    private function createReader(string $path): ReaderInterface
    {
        if (str_ends_with(strtolower($path), '.csv')) {
            $csv = new CsvReader();
            $csv->setDelimiter(',');
            $csv->open($path);

            return $csv;
        }

        $xlsx = new XlsxReader(new XlsxOptions());
        $xlsx->open($path);

        return $xlsx;
    }
}
