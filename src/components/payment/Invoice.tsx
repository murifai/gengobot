'use client';

import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/separator';
import { Download, Printer } from 'lucide-react';

export interface InvoiceData {
  invoiceNumber: string;
  orderId: string;
  date: Date;
  customerName: string;
  customerEmail: string;
  tier: string;
  durationMonths: number;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod?: string;
  paymentChannel?: string;
  status: 'PAID' | 'PENDING' | 'FAILED' | 'EXPIRED';
}

interface InvoiceProps {
  data: InvoiceData;
  showActions?: boolean;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export function Invoice({ data, showActions = true }: InvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = invoiceRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${data.invoiceNumber}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 40px;
              max-width: 600px;
              margin: 0 auto;
            }
            .invoice-header {
              text-align: center;
              margin-bottom: 30px;
            }
            .invoice-header h1 {
              font-size: 24px;
              margin: 0 0 5px 0;
            }
            .invoice-header p {
              color: #666;
              margin: 0;
            }
            .invoice-meta {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              font-size: 14px;
            }
            .invoice-meta div {
              text-align: left;
            }
            .invoice-meta div:last-child {
              text-align: right;
            }
            .invoice-meta strong {
              display: block;
              margin-bottom: 5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #eee;
            }
            th {
              background: #f9f9f9;
              font-weight: 600;
            }
            .text-right {
              text-align: right;
            }
            .totals {
              margin-top: 20px;
            }
            .totals tr td {
              border: none;
              padding: 8px 12px;
            }
            .totals tr:last-child {
              font-weight: bold;
              font-size: 18px;
              border-top: 2px solid #000;
            }
            .status-paid {
              color: #16a34a;
              font-weight: bold;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleDownload = () => {
    handlePrint();
  };

  const statusColors = {
    PAID: 'text-green-600',
    PENDING: 'text-yellow-600',
    FAILED: 'text-red-600',
    EXPIRED: 'text-gray-600',
  };

  const statusLabels = {
    PAID: 'Lunas',
    PENDING: 'Menunggu Pembayaran',
    FAILED: 'Gagal',
    EXPIRED: 'Kadaluarsa',
  };

  return (
    <Card className="max-w-2xl mx-auto">
      {showActions && (
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle>Invoice</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Cetak
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </CardHeader>
      )}

      <CardContent className="pt-6">
        <div ref={invoiceRef}>
          {/* Invoice Header */}
          <div className="invoice-header text-center mb-8">
            <h1 className="text-2xl font-bold">Gengo</h1>
            <p className="text-muted-foreground">Platform Belajar Bahasa Jepang</p>
          </div>

          {/* Invoice Meta */}
          <div className="invoice-meta flex justify-between mb-8 text-sm">
            <div>
              <strong className="block mb-1">Ditagihkan kepada:</strong>
              <p className="text-muted-foreground">{data.customerName}</p>
              <p className="text-muted-foreground">{data.customerEmail}</p>
            </div>
            <div className="text-right">
              <strong className="block mb-1">Invoice #{data.invoiceNumber}</strong>
              <p className="text-muted-foreground">Tanggal: {formatDate(data.date)}</p>
              <p className={`font-medium ${statusColors[data.status]}`}>
                {statusLabels[data.status]}
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Invoice Items */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-3 text-left font-semibold">Deskripsi</th>
                <th className="py-3 text-right font-semibold">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3">
                  <div className="font-medium">Gengo {data.tier} Plan</div>
                  <div className="text-muted-foreground">Langganan {data.durationMonths} bulan</div>
                </td>
                <td className="py-3 text-right">{formatCurrency(data.originalAmount)}</td>
              </tr>

              {data.discountAmount > 0 && (
                <tr className="border-b">
                  <td className="py-3">
                    <div className="font-medium text-green-600">Diskon</div>
                  </td>
                  <td className="py-3 text-right text-green-600">
                    -{formatCurrency(data.discountAmount)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals */}
          <div className="totals mt-4">
            <table className="w-full text-sm">
              <tbody>
                {data.discountAmount > 0 && (
                  <tr>
                    <td className="py-2">Subtotal</td>
                    <td className="py-2 text-right">{formatCurrency(data.originalAmount)}</td>
                  </tr>
                )}
                <tr className="border-t-2 border-black">
                  <td className="py-3 font-bold text-lg">Total</td>
                  <td className="py-3 text-right font-bold text-lg">
                    {formatCurrency(data.finalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Details */}
          {data.paymentMethod && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg text-sm">
              <strong className="block mb-2">Detail Pembayaran:</strong>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <span>Metode Pembayaran:</span>
                <span className="capitalize">{data.paymentMethod.replace(/_/g, ' ')}</span>
                {data.paymentChannel && (
                  <>
                    <span>Channel:</span>
                    <span className="uppercase">{data.paymentChannel}</span>
                  </>
                )}
                <span>Order ID:</span>
                <span className="font-mono text-xs">{data.orderId}</span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="footer mt-8 text-center text-muted-foreground text-xs">
            <p>Terima kasih telah berlangganan Gengo!</p>
            <p className="mt-1">Jika ada pertanyaan, hubungi kami di support@gengo.id</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default Invoice;
