<?php

namespace App\Services\Import;

use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer as XlsxWriter;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ImportTemplateDownloader
{
    public function download(string $filename, array $headers, array $exampleRow): StreamedResponse
    {
        return response()->streamDownload(function () use ($headers, $exampleRow): void {
            $writer = new XlsxWriter();
            $writer->openToFile('php://output');
            $writer->getCurrentSheet()->setName('Template');
            $writer->addRow(Row::fromValues($headers));
            $writer->addRow(Row::fromValues($exampleRow));
            $writer->close();
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}
