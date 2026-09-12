<?php

namespace App\Services\PaymentGateway;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class DokuService
{
    private string $clientId;
    private string $secretKey;
    private string $apiKey;
    private string $baseUrl;

    public function __construct()
    {
        $this->clientId = (string) config('services.doku.client_id');
        $this->secretKey = (string) config('services.doku.secret_key');
        $this->apiKey = (string) config('services.doku.api_key');
        $this->baseUrl = (string) config('services.doku.base_url', 'https://api-sandbox.doku.com');
    }

    /**
     * Create DOKU Checkout URL & session for a given payment.
     */
    public function createCheckout(Payment $payment, array $options = []): array
    {
        $targetPath = '/checkout/v1/payment';
        $requestId = (string) Str::uuid();
        $timestamp = gmdate('Y-m-d\TH:i:s\Z');

        $payment->loadMissing(['member', 'plan']);

        $customerName = trim($payment->member?->name ?? 'Member KBKB');
        $customerEmail = $payment->member?->email ?? 'member@kbkb.id';
        $customerPhone = $this->formatPhoneNumber($payment->member?->phone);
        $planName = $payment->plan?->name ?? "Paket {$payment->period_months} Bulan";

        $planPrice = (int) ($payment->plan?->price ?? $payment->amount);
        $adminFee = max(0, (int) $payment->amount - $planPrice);

        $lineItems = [
            [
                'id' => 'PLAN-' . ($payment->plan_id ?? 'SUB'),
                'name' => 'Langganan Membership KBKB - ' . $planName,
                'quantity' => 1,
                'price' => $planPrice,
            ],
        ];

        if ($adminFee > 0) {
            $lineItems[] = [
                'id' => 'FEE-ADMIN',
                'name' => 'Biaya Layanan Gateway Pembayaran',
                'quantity' => 1,
                'price' => $adminFee,
            ];
        }

        $body = [
            'order' => [
                'amount' => (int) $payment->amount,
                'invoice_number' => $payment->invoice_number,
                'currency' => 'IDR',
                'callback_url' => route('member.billing.index'),
                'auto_redirect' => true,
                'line_items' => $lineItems,
            ],
            'payment' => [
                'payment_due_date' => 60, // menit
            ],
            'customer' => [
                'id' => (string) $payment->member_id,
                'name' => $customerName,
                'email' => $customerEmail,
                'phone' => $customerPhone,
            ],
        ];

        if (! empty($options['payment_method_types'])) {
            $body['payment']['payment_method_types'] = $options['payment_method_types'];
        }

        $jsonBody = json_encode($body, JSON_UNESCAPED_SLASHES);
        $signature = $this->generateSignature($targetPath, $requestId, $timestamp, $jsonBody);

        $headers = [
            'Content-Type' => 'application/json',
            'Client-Id' => $this->clientId,
            'Request-Id' => $requestId,
            'Request-Timestamp' => $timestamp,
            'Signature' => $signature,
        ];

        try {
            $response = Http::withHeaders($headers)
                ->withBody($jsonBody, 'application/json')
                ->timeout(15)
                ->post($this->baseUrl . $targetPath);

            $result = $response->json();

            if ($response->successful() && isset($result['response']['payment']['url'])) {
                return [
                    'success' => true,
                    'url' => $result['response']['payment']['url'],
                    'token_id' => $result['response']['payment']['token_id'] ?? null,
                    'expired_datetime' => $result['response']['payment']['expired_datetime'] ?? null,
                    'invoice_number' => $payment->invoice_number,
                    'data' => $result['response'],
                ];
            }

            Log::error('DOKU Checkout failed', [
                'status' => $response->status(),
                'response' => $result,
                'payment_id' => $payment->id,
            ]);

            return [
                'success' => false,
                'message' => $result['message'][0] ?? 'Gagal membuat sesi pembayaran DOKU',
                'details' => $result,
            ];
        } catch (\Throwable $e) {
            Log::error('DOKU Checkout Exception: ' . $e->getMessage(), [
                'payment_id' => $payment->id,
            ]);

            return [
                'success' => false,
                'message' => 'Terjadi kendala koneksi ke server gateway DOKU.',
            ];
        }
    }

    /**
     * Create Direct Virtual Account for supported banks (BCA, Mandiri, BRI, BNI).
     */
    public function createVirtualAccount(Payment $payment, string $bank = 'bca'): array
    {
        $bank = strtolower($bank);
        $endpointMap = [
            'bca' => '/bca-virtual-account/v2/payment-code',
            'mandiri' => '/mandiri-virtual-account/v2/payment-code',
            'bri' => '/bri-virtual-account/v2/payment-code',
            'bni' => '/bni-virtual-account/v2/payment-code',
            'permata' => '/permata-virtual-account/v2/payment-code',
        ];

        if (! isset($endpointMap[$bank])) {
            return [
                'success' => false,
                'message' => "Bank channel {$bank} tidak didukung.",
            ];
        }

        $targetPath = $endpointMap[$bank];
        $requestId = (string) Str::uuid();
        $timestamp = gmdate('Y-m-d\TH:i:s\Z');

        $payment->loadMissing(['member', 'plan']);

        $body = [
            'order' => [
                'invoice_number' => $payment->invoice_number,
                'amount' => (int) $payment->amount,
            ],
            'virtual_account_info' => [
                'expired_time' => 60,
                'reusable_status' => false,
                'info1' => 'KBKB ' . strtoupper($bank),
            ],
            'customer' => [
                'name' => $payment->member?->name ?? 'Member KBKB',
                'email' => $payment->member?->email ?? 'member@kbkb.id',
            ],
        ];

        if ($bank === 'bni') {
            $body['virtual_account_info']['merchant_unique_reference'] = (string) $payment->id;
        }

        $jsonBody = json_encode($body, JSON_UNESCAPED_SLASHES);
        $signature = $this->generateSignature($targetPath, $requestId, $timestamp, $jsonBody);

        $headers = [
            'Content-Type' => 'application/json',
            'Client-Id' => $this->clientId,
            'Request-Id' => $requestId,
            'Request-Timestamp' => $timestamp,
            'Signature' => $signature,
        ];

        try {
            $response = Http::withHeaders($headers)
                ->withBody($jsonBody, 'application/json')
                ->timeout(15)
                ->post($this->baseUrl . $targetPath);

            $result = $response->json();

            if ($response->successful() && isset($result['virtual_account_info']['virtual_account_number'])) {
                return [
                    'success' => true,
                    'bank' => strtoupper($bank),
                    'va_number' => $result['virtual_account_info']['virtual_account_number'],
                    'how_to_pay_page' => $result['virtual_account_info']['how_to_pay_page'] ?? null,
                    'expired_date_utc' => $result['virtual_account_info']['expired_date_utc'] ?? null,
                    'invoice_number' => $payment->invoice_number,
                ];
            }

            Log::error("DOKU Direct VA {$bank} failed", [
                'status' => $response->status(),
                'response' => $result,
                'payment_id' => $payment->id,
            ]);

            return [
                'success' => false,
                'message' => $result['error']['message'] ?? $result['message'][0] ?? 'Gagal membuat nomor VA',
                'details' => $result,
            ];
        } catch (\Throwable $e) {
            Log::error("DOKU Direct VA Exception: {$e->getMessage()}", [
                'payment_id' => $payment->id,
            ]);

            return [
                'success' => false,
                'message' => 'Terjadi kendala koneksi ke server gateway DOKU.',
            ];
        }
    }

    /**
     * Generate HMAC-SHA256 signature for outgoing request.
     */
    public function generateSignature(string $targetPath, string $requestId, string $timestamp, string $rawJsonBody): string
    {
        $digest = base64_encode(hash('sha256', $rawJsonBody, true));

        $component = "Client-Id:{$this->clientId}\n" .
                     "Request-Id:{$requestId}\n" .
                     "Request-Timestamp:{$timestamp}\n" .
                     "Request-Target:{$targetPath}\n" .
                     "Digest:{$digest}";

        return 'HMACSHA256=' . base64_encode(hash_hmac('sha256', $component, $this->secretKey, true));
    }

    /**
     * Validate incoming notification signature from DOKU.
     */
    public function verifyNotificationSignature(Request $request): bool
    {
        $receivedSignature = $request->header('Signature') ?? $request->header('signature');
        $clientId = $request->header('Client-Id') ?? $request->header('client-id');
        $requestId = $request->header('Request-Id') ?? $request->header('request-id');
        $timestamp = $request->header('Request-Timestamp') ?? $request->header('request-timestamp');

        if (! $receivedSignature || ! $clientId || ! $requestId || ! $timestamp) {
            Log::warning('DOKU notification missing required signature headers', [
                'headers' => $request->headers->all(),
            ]);
            return false;
        }

        // Client ID must match our configured Client ID
        if ($clientId !== $this->clientId) {
            Log::warning('DOKU notification client ID mismatch', [
                'expected' => $this->clientId,
                'received' => $clientId,
            ]);
            return false;
        }

        $rawBody = $request->getContent();
        $digest = base64_encode(hash('sha256', $rawBody, true));
        $targetPath = '/' . ltrim($request->path(), '/');

        $component = "Client-Id:{$this->clientId}\n" .
                     "Request-Id:{$requestId}\n" .
                     "Request-Timestamp:{$timestamp}\n" .
                     "Request-Target:{$targetPath}\n" .
                     "Digest:{$digest}";

        $expectedSignature = 'HMACSHA256=' . base64_encode(hash_hmac('sha256', $component, $this->secretKey, true));

        $isValid = hash_equals($expectedSignature, $receivedSignature);

        if (! $isValid) {
            Log::warning('DOKU notification signature verification failed', [
                'expected' => $expectedSignature,
                'received' => $receivedSignature,
                'target_path' => $targetPath,
            ]);
        }

        return $isValid;
    }

    /**
     * Format phone number to Indonesian DOKU requirement (e.g. 6281234567890).
     */
    public function formatPhoneNumber(?string $phone): string
    {
        if (! $phone) {
            return '6281234567890';
        }

        $digits = preg_replace('/\D/', '', $phone);

        if (str_starts_with($digits, '0')) {
            $digits = '62' . substr($digits, 1);
        } elseif (str_starts_with($digits, '8')) {
            $digits = '62' . $digits;
        }

        if (! str_starts_with($digits, '62') || strlen($digits) < 9 || strlen($digits) > 16) {
            return '6281234567890';
        }

        return $digits;
    }

    /**
     * Get configured payment gateway admin fee to pass through to customer.
     */
    public function getAdminFee(): int
    {
        return (int) config('services.doku.admin_fee', 4500);
    }
}
