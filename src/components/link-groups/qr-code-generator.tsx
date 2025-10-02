'use client';

import { useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { QrCodeIcon, DownloadIcon } from 'lucide-react';

interface QRCodeGeneratorProps {
  url: string;
  title: string;
}

export function QRCodeGenerator({ url, title }: QRCodeGeneratorProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  const generateQRCode = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      });
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    if (open && !qrCodeDataUrl) {
      generateQRCode();
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <QrCodeIcon className="mr-2 h-4 w-4" />
          QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code for {title}</DialogTitle>
          <DialogDescription>
            Scan this QR code to visit your link group page instantly
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          {qrCodeDataUrl ? (
            <>
              <div className="rounded-lg border-2 border-neutral-200 p-4">
                <img
                  src={qrCodeDataUrl}
                  alt={`QR code for ${title}`}
                  className="h-auto w-full max-w-sm"
                />
              </div>
              <div className="text-center text-sm text-neutral-600">
                <p className="font-mono text-xs break-all">{url}</p>
              </div>
              <Button onClick={downloadQRCode} className="w-full">
                <DownloadIcon className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
            </>
          ) : (
            <div className="flex h-64 w-64 items-center justify-center rounded-lg border-2 border-dashed border-neutral-300">
              <p className="text-sm text-neutral-500">Generating QR code...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
