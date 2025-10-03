'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { QrCodeIcon, DownloadIcon, Loader2Icon } from 'lucide-react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  url: string;
  linkTitle?: string;
}

export function QRCodeGenerator({ url, linkTitle }: QRCodeGeneratorProps) {
  const [qrCode, setQrCode] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && !qrCode) {
      generateQRCode();
    }
  }, [isOpen]);

  const generateQRCode = async () => {
    setLoading(true);
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCode(qrDataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCode) return;

    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `qr-code-${linkTitle || 'affiliate-link'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} variant="outline" size="sm">
        <QrCodeIcon className="mr-2 h-4 w-4" />
        QR Code
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">QR Code</h3>
        <Button onClick={() => setIsOpen(false)} variant="ghost" size="sm">
          Close
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2Icon className="h-8 w-8 animate-spin text-neutral-400" />
        </div>
      ) : qrCode ? (
        <div className="space-y-4">
          <div className="flex justify-center">
            <img src={qrCode} alt="QR Code" className="rounded-lg border" />
          </div>
          <div className="flex gap-2">
            <Button onClick={downloadQRCode} className="flex-1">
              <DownloadIcon className="mr-2 h-4 w-4" />
              Download PNG
            </Button>
          </div>
          <p className="text-center text-xs text-neutral-500">
            Scan this QR code to access your affiliate link
          </p>
        </div>
      ) : null}
    </div>
  );
}
