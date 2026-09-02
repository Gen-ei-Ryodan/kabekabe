<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\CommunityInfo;
use App\Models\EventAttendance;
use App\Models\Payment;
use App\Models\Transaction;
use Inertia\Inertia;
use Inertia\Response;

class HistoryController extends Controller
{
    public function __invoke(): Response
    {
        $user = auth()->user();
        $user->load('membership');

        $transactions = Transaction::query()
            ->where('member_id', $user->id)
            ->with(['partner:id,name,category,logo', 'promo:id,title'])
            ->orderByDesc('transacted_at')
            ->paginate(12)
            ->withQueryString();

        $payments = $user->payments()
            ->with(['plan:id,name,duration_months', 'event:id,title,event_date,location'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $payments->getCollection()->transform(fn (Payment $payment) => [
            'id' => $payment->id,
            'invoice_number' => $payment->invoice_number,
            'amount' => $payment->amount,
            'status' => $payment->status,
            'status_label' => match ($payment->status) {
                Payment::STATUS_PENDING => 'Pending',
                Payment::STATUS_APPROVED => 'Approved',
                Payment::STATUS_REJECTED => 'Rejected',
                Payment::STATUS_EXPIRED => 'Expired',
                default => ucfirst((string) $payment->status),
            },
            'plan' => $payment->plan ? [
                'id' => $payment->plan->id,
                'name' => $payment->plan->name,
                'duration_months' => $payment->plan->duration_months,
            ] : null,
            'event' => $payment->event ? [
                'id' => $payment->event->id,
                'title' => $payment->event->title,
                'event_date' => $payment->event->event_date?->format('d M Y'),
                'location' => $payment->event->location,
            ] : null,
            'paid_at' => $payment->paid_at?->format('d M Y'),
            'created_at' => $payment->created_at?->format('d M Y'),
        ]);

        $totalPaymentMade = $payments->sum('amount');

        $attendances = EventAttendance::query()
            ->where('member_id', $user->id)
            ->with(['event:id,title,event_date,location'])
            ->orderByDesc('scanned_at')
            ->get()
            ->map(fn (EventAttendance $a) => [
                'id' => $a->id,
                'event_id' => $a->event_id,
                'event_title' => $a->event?->title,
                'event_date' => $a->event?->event_date?->format('d M Y'),
                'event_location' => $a->event?->location,
                'scanned_at' => $a->scanned_at?->format('d M Y H:i'),
                'scanned_at_human' => $a->scanned_at?->diffForHumans(),
            ]);

        return Inertia::render('Member/History/Index', [
            'transactions' => $transactions,
            'total_benefit' => $user->memberTransactions()->sum('discount_amount'),
            'payments' => $payments,
            'total_payment_made' => $totalPaymentMade,
            'attendances' => $attendances,
            'membership' => [
                'status' => $user->hasActiveMembership() ? 'active' : 'inactive',
                'status_label' => $user->hasActiveMembership() ? 'ACTIVE' : 'INACTIVE',
                'expires_at' => $user->membership?->expires_at?->format('d M Y'),
            ],
        ]);
    }
}