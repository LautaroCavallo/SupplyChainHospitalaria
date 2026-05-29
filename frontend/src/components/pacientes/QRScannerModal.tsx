import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Camera, CameraOff, RefreshCw, QrCode } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

type ScanState = 'idle' | 'loading' | 'scanning' | 'error';

export default function QRScannerModal({ isOpen, onClose, onScan }: QRScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const jsQRRef = useRef<((data: Uint8ClampedArray, width: number, height: number) => { data: string } | null) | null>(null);

  const [scanState, setScanState] = useState<ScanState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [lastScanned, setLastScanned] = useState('');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  // Load jsQR dynamically
  const loadJsQR = useCallback(async () => {
    if (jsQRRef.current) return true;
    try {
      // jsQR is loaded from CDN as a script; access via window
      if ((window as unknown as Record<string, unknown>)['jsQR']) {
        jsQRRef.current = (window as unknown as Record<string, unknown>)['jsQR'] as typeof jsQRRef.current;
        return true;
      }
      // Inject script if not loaded
      await new Promise<void>((resolve, reject) => {
        const existing = document.getElementById('jsqr-script');
        if (existing) { resolve(); return; }
        const script = document.createElement('script');
        script.id = 'jsqr-script';
        script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('No se pudo cargar jsQR'));
        document.head.appendChild(script);
      });
      jsQRRef.current = (window as unknown as Record<string, unknown>)['jsQR'] as typeof jsQRRef.current;
      return !!jsQRRef.current;
    } catch {
      return false;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const jsQR = jsQRRef.current;
    if (!video || !canvas || !jsQR || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      animFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code && code.data && code.data !== lastScanned) {
      setLastScanned(code.data);
      stopCamera();
      onScan(code.data);
      onClose();
      return;
    }

    animFrameRef.current = requestAnimationFrame(scanFrame);
  }, [lastScanned, onScan, onClose, stopCamera]);

  const startCamera = useCallback(async (deviceId?: string) => {
    stopCamera();
    setScanState('loading');
    setErrorMsg('');

    const loaded = await loadJsQR();
    if (!loaded) {
      setScanState('error');
      setErrorMsg('No se pudo cargar el escáner QR. Verifique su conexión a internet.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Enumerate cameras after permission granted
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter((d) => d.kind === 'videoinput');
      setDevices(videoDevices);
      if (!selectedDeviceId && videoDevices.length > 0) {
        const activeTrack = stream.getVideoTracks()[0];
        const activeDeviceId = activeTrack.getSettings().deviceId ?? videoDevices[0].deviceId;
        setSelectedDeviceId(activeDeviceId);
      }

      setScanState('scanning');
      animFrameRef.current = requestAnimationFrame(scanFrame);
    } catch (err) {
      setScanState('error');
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setErrorMsg('Permiso de cámara denegado. Habilítelo en la configuración del navegador.');
        } else if (err.name === 'NotFoundError') {
          setErrorMsg('No se encontró ninguna cámara en este dispositivo.');
        } else if (err.name === 'NotReadableError') {
          setErrorMsg('La cámara está siendo usada por otra aplicación.');
        } else {
          setErrorMsg(`Error de cámara: ${err.message}`);
        }
      } else {
        setErrorMsg('Error desconocido al acceder a la cámara.');
      }
    }
  }, [stopCamera, loadJsQR, selectedDeviceId, scanFrame]);

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen) {
      setLastScanned('');
      startCamera();
    } else {
      stopCamera();
      setScanState('idle');
      setErrorMsg('');
    }
    return () => stopCamera();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Restart scan loop when scanState becomes 'scanning' (after device switch)
  useEffect(() => {
    if (scanState === 'scanning' && !animFrameRef.current) {
      animFrameRef.current = requestAnimationFrame(scanFrame);
    }
  }, [scanState, scanFrame]);

  // Keyboard close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    startCamera(deviceId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
              <QrCode className="h-4 w-4 text-green-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Escanear QR de Receta</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Camera area */}
        <div className="relative bg-black" style={{ aspectRatio: '4/3' }}>
          {/* Video feed */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
            style={{ display: scanState === 'scanning' ? 'block' : 'none' }}
          />
          {/* Hidden canvas for frame analysis */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanning overlay */}
          {scanState === 'scanning' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Dark vignette */}
              <div className="absolute inset-0"
                style={{
                  background: 'radial-gradient(ellipse 55% 55% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)'
                }}
              />
              {/* Scanning frame */}
              <div className="relative" style={{ width: 220, height: 220 }}>
                {/* Corner brackets */}
                {[
                  'top-0 left-0 border-t-4 border-l-4 rounded-tl-lg',
                  'top-0 right-0 border-t-4 border-r-4 rounded-tr-lg',
                  'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-lg',
                  'bottom-0 right-0 border-b-4 border-r-4 rounded-br-lg',
                ].map((cls, i) => (
                  <div key={i} className={`absolute w-10 h-10 border-green-400 ${cls}`} />
                ))}
                {/* Scanning line animation */}
                <div className="absolute left-2 right-2 h-0.5 bg-green-400 opacity-80 animate-scan-line" />
              </div>
              <p className="absolute bottom-6 left-0 right-0 text-center text-xs text-white/80 font-medium">
                Apunte al código QR de la receta
              </p>
            </div>
          )}

          {/* Loading state */}
          {scanState === 'loading' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 gap-3">
              <div className="h-10 w-10 rounded-full border-4 border-green-500 border-t-transparent animate-spin" />
              <p className="text-sm text-gray-300">Iniciando cámara…</p>
            </div>
          )}

          {/* Error state */}
          {scanState === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 gap-4 px-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20">
                <CameraOff className="h-7 w-7 text-red-400" />
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{errorMsg}</p>
              <button
                onClick={() => startCamera(selectedDeviceId || undefined)}
                className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Reintentar
              </button>
            </div>
          )}

          {/* Idle state */}
          {scanState === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 gap-4">
              <Camera className="h-12 w-12 text-gray-600" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          {/* Camera selector (only shown when multiple cameras available) */}
          {devices.length > 1 && (
            <div className="mb-3">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Cámara
              </label>
              <select
                value={selectedDeviceId}
                onChange={(e) => handleDeviceChange(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-green-500 focus:outline-none"
              >
                {devices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Cámara ${devices.indexOf(d) + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <p className="text-xs text-gray-400 text-center">
            El código QR debe contener el ID de la receta (ej. REC-4829-2024)
          </p>
        </div>
      </div>

      {/* Scan line animation */}
      <style>{`
        @keyframes scan-line {
          0%   { top: 8px; opacity: 1; }
          49%  { top: calc(100% - 8px); opacity: 1; }
          50%  { top: calc(100% - 8px); opacity: 0; }
          51%  { top: 8px; opacity: 0; }
          52%  { top: 8px; opacity: 1; }
          100% { top: 8px; opacity: 1; }
        }
        .animate-scan-line {
          animation: scan-line 2.4s ease-in-out infinite;
          position: absolute;
        }
      `}</style>
    </div>
  );
}
