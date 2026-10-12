<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\ReportingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer as XlsxWriter;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    private function vendorPartner(): ?\App\Models\Partner
    {
        $user = Auth::guard('partner')->user() ?? auth()->user();

        return $user?->partner;
    }

    public function __invoke(Request $request): Response
    {
        $partner = $this->vendorPartner();
        abort_if($partner === null, 403);

        $from = $request->string('from')->toString() ?: now()->startOfMonth()->toDateString();
        $to = $request->string('to')->toString() ?: now()->toDateString();

        $summary = Transaction::query()
            ->where('partner_id', $partner->id)
            ->whereDate('transacted_at', '>=', $from)
            ->whereDate('transacted_at', '<=', $to)
            ->selectRaw('COALESCE(SUM(total_amount),0) as total_amount')
            ->selectRaw('COALESCE(SUM(discount_amount),0) as discount_amount')
            ->selectRaw('COALESCE(SUM(net_amount),0) as net_amount')
            ->selectRaw('COUNT(*) as total_transactions')
            ->first();

        $transactions = Transaction::query()
            ->where('partner_id', $partner->id)
            ->with('member:id,name,member_code')
            ->whereDate('transacted_at', '>=', $from)
            ->whereDate('transacted_at', '<=', $to)
            ->orderByDesc('transacted_at')
            ->get();

        $byDay = Transaction::query()
            ->where('partner_id', $partner->id)
            ->whereDate('transacted_at', '>=', $from)
            ->whereDate('transacted_at', '<=', $to)
            ->selectRaw(ReportingService::dayExpr().' as day, COUNT(*) as total, COALESCE(SUM(net_amount),0) as net')
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        return Inertia::render('Vendor/Reports/Index', [
            'summary' => $summary,
            'transactions' => $transactions,
            'by_day' => $byDay,
            'filters' => compact('from', 'to'),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $partner = $this->vendorPartner();
        abort_if($partner === null, 403);

        $from = $request->string('from')->toString() ?: now()->startOfMonth()->toDateString();
        $to = $request->string('to')->toString() ?: now()->toDateString();

        $transactions = Transaction::query()
            ->where('partner_id', $partner->id)
            ->with('member:id,name,member_code')
            ->whereDate('transacted_at', '>=', $from)
            ->whereDate('transacted_at', '<=', $to)
            ->orderBy('transacted_at')
            ->get();

        $filename = "laporan-transaksi-vendor-{$from}-sd-{$to}.xlsx";

        return response()->streamDownload(function () use ($transactions): void {
            $writer = new XlsxWriter;
            $writer->openToFile('php://output');
            $writer->getCurrentSheet()->setName('Laporan Transaksi');

            $writer->addRow(Row::fromValues([
                'No',
                'Tanggal & Waktu',
                'No. Transaksi',
                'Nama Member',
                'Kode Member',
                'Total Belanja (Rp)',
                'Diskon (Rp)',
                'Pembayaran Bersih (Rp)',
                'Catatan',
            ]));

            $totalAmount = 0;
            $totalDiscount = 0;
            $totalNet = 0;

            foreach ($transactions as $i => $t) {
                $totalAmount += (int) $t->total_amount;
                $totalDiscount += (int) $t->discount_amount;
                $totalNet += (int) $t->net_amount;

                $writer->addRow(Row::fromValues([
                    $i + 1,
                    $t->transacted_at?->format('Y-m-d H:i') ?? '-',
                    $t->transaction_number,
                    $t->member?->name ?? '-',
                    $t->member?->member_code ?? '-',
                    $t->total_amount,
                    $t->discount_amount,
                    $t->net_amount,
                    $t->note ?? '-',
                ]));
            }

            $writer->addRow(Row::fromValues([
                '',
                '',
                '',
                '',
                'TOTAL',
                $totalAmount,
                $totalDiscount,
                $totalNet,
                '',
            ]));

            $writer->close();
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}
