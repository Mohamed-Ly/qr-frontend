import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { FiCamera, FiCheckCircle, FiXCircle, FiZap, FiClock, FiRefreshCw, FiEdit, FiCopy, FiCheck } from 'react-icons/fi';
import { qrService } from '../../store/services/qrService';

// States
const SCAN_STATE = {
  IDLE: 'idle',
  SCANNING: 'scanning',
  MANUAL: 'manual',
  SUCCESS: 'success',
  ERROR: 'error',
};

export default function ScanQR() {
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [scanState, setScanState] = useState(SCAN_STATE.IDLE);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Manual mode states
  const [manualToken, setManualToken] = useState('');
  const [manualLectureId, setManualLectureId] = useState('');
  const [copied, setCopied] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        const state = html5QrCodeRef.current.getState();
        // State 2 = SCANNING, State 3 = PAUSED
        if (state === 2 || state === 3) {
          await html5QrCodeRef.current.stop();
        }
      } catch (_) {}
      html5QrCodeRef.current = null;
    }
  };

  // Check if camera is available
  const checkCameraAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      
      if (cameras.length === 0) {
        setErrorMsg('لا توجد كاميرا متصلة بجهازك. يرجى استخدام الإدخال اليدوي.');
        return false;
      }
      
      // Try to get permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err) {
      console.error("Camera permission error:", err);
      if (err.name === "NotAllowedError") {
        setErrorMsg('لم تسمح بالوصول إلى الكاميرا. يمكنك استخدام الإدخال اليدوي بدلاً من ذلك.');
      } else if (err.name === "NotFoundError") {
        setErrorMsg('لا توجد كاميرا متصلة بجهازك. يرجى استخدام الإدخال اليدوي.');
      } else {
        setErrorMsg('تعذّر الوصول إلى الكاميرا. يرجى استخدام الإدخال اليدوي.');
      }
      return false;
    }
  };

  const startScanner = async () => {
    setResult(null);
    setErrorMsg('');
    
    const hasCamera = await checkCameraAvailability();
    if (!hasCamera) {
      setScanState(SCAN_STATE.MANUAL);
      return;
    }

    setScanState(SCAN_STATE.SCANNING);

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      await stopScanner();

      const html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => onScanSuccess(decodedText, html5QrCode),
        () => {} // ignore frame errors
      );
    } catch (err) {
      console.error("Scanner start error:", err);
      setScanState(SCAN_STATE.ERROR);
      setErrorMsg('حدث خطأ أثناء تشغيل الكاميرا. يرجى استخدام الإدخال اليدوي.');
    }
  };

  const onScanSuccess = async (decodedText, html5QrCode) => {
    if (isProcessing) return;
    setIsProcessing(true);

    // Stop camera first
    try {
      if (html5QrCode) {
        await html5QrCode.stop();
      }
      html5QrCodeRef.current = null;
    } catch (_) {}

    // Parse the QR payload — expected format: JSON { token, lectureId }
    let parsed = null;
    try {
      parsed = JSON.parse(decodedText);
    } catch {
      // Maybe plain token string with lectureId — show manual entry prompt
      setScanState(SCAN_STATE.ERROR);
      setErrorMsg('تنسيق رمز QR غير مدعوم. يرجى استخدام الإدخال اليدوي.');
      setIsProcessing(false);
      return;
    }

    const { token, lectureId } = parsed;
    if (!token || !lectureId) {
      setScanState(SCAN_STATE.ERROR);
      setErrorMsg('بيانات رمز QR غير مكتملة.');
      setIsProcessing(false);
      return;
    }

    // Call backend
    try {
      const res = await qrService.verifyQr(token, lectureId);
      setResult(res.attendance || res);
      setScanState(SCAN_STATE.SUCCESS);
      toast.success(res.message || 'تم تسجيل حضورك بنجاح!');
    } catch (err) {
      const msg = err?.response?.data?.message || 'حدث خطأ أثناء التحقق من الرمز.';
      setErrorMsg(msg);
      setScanState(SCAN_STATE.ERROR);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualVerify = async () => {
    if (!manualToken || !manualLectureId) {
      toast.error('يرجى إدخال رمز QR ورقم المحاضرة');
      return;
    }
    
    setIsProcessing(true);
    try {
      const res = await qrService.verifyQr(manualToken, parseInt(manualLectureId));
      setResult(res.attendance || res);
      setScanState(SCAN_STATE.SUCCESS);
      toast.success(res.message || 'تم تسجيل حضورك بنجاح!');
    } catch (err) {
      const msg = err?.response?.data?.message || 'حدث خطأ أثناء التحقق من الرمز.';
      setErrorMsg(msg);
      setScanState(SCAN_STATE.ERROR);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      // Try to parse as JSON
      try {
        const parsed = JSON.parse(text);
        if (parsed.token && parsed.lectureId) {
          setManualToken(parsed.token);
          setManualLectureId(parsed.lectureId.toString());
          toast.success('تم لصق البيانات بنجاح');
          return;
        }
      } catch (_) {}
      
      // If not JSON, maybe just token
      setManualToken(text);
      toast.info('تم لصق الرمز. يرجى إدخال رقم المحاضرة يدوياً إذا لزم الأمر.');
    } catch (err) {
      toast.error('تعذّرت القراءة من الحافظة. يرجى اللصق يدوياً.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = async () => {
    await stopScanner();
    setScanState(SCAN_STATE.IDLE);
    setResult(null);
    setErrorMsg('');
    setManualToken('');
    setManualLectureId('');
  };

  const getStatusColor = (status) => {
    if (status === 'PRESENT' || status === 'حاضر') return 'text-green-600';
    if (status === 'LATE' || status === 'متأخر') return 'text-orange-500';
    return 'text-red-600';
  };

  const getStatusText = (status) => {
    if (status === 'PRESENT') return 'حاضر';
    if (status === 'LATE') return 'متأخر';
    if (status === 'ABSENT') return 'غائب';
    return status;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">تسجيل الحضور</h1>

      <div className="max-w-md mx-auto space-y-6">

        {/* Scanner Card */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">

          {/* ── IDLE ── */}
          {scanState === SCAN_STATE.IDLE && (
            <div className="flex flex-col items-center gap-6 py-6">
              <div className="w-32 h-32 rounded-2xl bg-primary/5 border-2 border-primary/20 flex items-center justify-center">
                <FiCamera className="w-14 h-14 text-primary/60" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-bold text-gray-800 mb-2">تسجيل الحضور</h2>
                <p className="text-sm text-gray-500">يمكنك مسح رمز QR أو إدخال البيانات يدوياً</p>
              </div>
              
              <div className="flex gap-3 w-full">
                <button
                  onClick={startScanner}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-white px-4 py-3 rounded-xl font-bold hover:bg-red-600 transition-all shadow-md shadow-primary/30"
                >
                  <FiCamera className="w-5 h-5" /> مسح بالكاميرا
                </button>
                <button
                  onClick={() => setScanState(SCAN_STATE.MANUAL)}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  <FiEdit className="w-5 h-5" /> إدخال يدوي
                </button>
              </div>
            </div>
          )}

          {/* ── MANUAL MODE ── */}
          {scanState === SCAN_STATE.MANUAL && (
            <div className="flex flex-col gap-5 py-4">
              <div className="text-center">
                <h2 className="text-lg font-bold text-gray-800 mb-1">إدخال بيانات QR يدوياً</h2>
                <p className="text-xs text-gray-400">يمكنك لصق البيانات المنسوخة من الدكتور</p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  رمز QR (Token)
                </label>
                <div className="flex gap-2">
                  <textarea
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="الصق رمز QR هنا..."
                    rows="3"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    dir="ltr"
                  />
                  <button
                    onClick={handlePasteFromClipboard}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                    title="لصق من الحافظة"
                  >
                    {copied ? <FiCheck className="w-5 h-5 text-green-600" /> : <FiCopy className="w-5 h-5 text-gray-600" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  مثال: {`{"token":"a1b2c3d4...","lectureId":1}`}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  رقم المحاضرة (Lecture ID)
                </label>
                <input
                  type="number"
                  value={manualLectureId}
                  onChange={(e) => setManualLectureId(e.target.value)}
                  placeholder="أدخل رقم المحاضرة"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              
              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleManualVerify}
                  disabled={!manualToken || !manualLectureId || isProcessing}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                  ) : (
                    'تأكيد الحضور'
                  )}
                </button>
                <button
                  onClick={() => {
                    setScanState(SCAN_STATE.IDLE);
                    setManualToken('');
                    setManualLectureId('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  رجوع
                </button>
              </div>
            </div>
          )}

          {/* ── SCANNING ── */}
          {scanState === SCAN_STATE.SCANNING && (
            <div className="flex flex-col items-center gap-4">
              {/* Camera viewport */}
              <div className="relative w-full rounded-2xl overflow-hidden border-4 border-gray-800 bg-black aspect-square">
                {/* Animated scan line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_12px_#EF4637] animate-[bounce_1.5s_ease-in-out_infinite] z-10" />
                {/* Corner markers */}
                <div className="absolute top-3 left-3 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl z-10" />
                <div className="absolute top-3 right-3 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr z-10" />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl z-10" />
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br z-10" />
                <div id="qr-reader" className="w-full" ref={scannerRef} />
              </div>

              <p className="text-sm text-gray-500 font-medium text-center">جارٍ البحث عن رمز QR...</p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={reset}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 py-2 rounded-xl font-semibold"
                >
                  <FiXCircle className="w-4 h-4" /> إلغاء
                </button>
                <button
                  onClick={() => setScanState(SCAN_STATE.MANUAL)}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary/10 text-primary py-2 rounded-xl font-semibold"
                >
                  <FiEdit className="w-4 h-4" /> إدخال يدوي
                </button>
              </div>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {scanState === SCAN_STATE.SUCCESS && result && (
            <div className="flex flex-col items-center gap-5 py-4">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <FiCheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-extrabold text-green-600 mb-1">تم تسجيل الحضور!</h2>
                <p className="text-sm text-gray-500">تفاصيل سجل الحضور الخاص بك</p>
              </div>

              {/* Attendance details */}
              <div className="w-full bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                {result.course && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-semibold">المادة:</span>
                    <span className="font-bold text-gray-800">{result.course.name}</span>
                  </div>
                )}
                {result.lecture && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-semibold">المحاضرة:</span>
                    <span className="font-bold text-gray-800">{result.lecture.title}</span>
                  </div>
                )}
                {result.status && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-semibold">الحالة:</span>
                    <span className={`font-extrabold text-base flex items-center gap-1 ${getStatusColor(result.status)}`}>
                      {result.status === 'PRESENT' ? <><FiCheckCircle />حاضر</> :
                       result.status === 'LATE' ? <><FiClock />متأخر</> :
                       getStatusText(result.status)}
                    </span>
                  </div>
                )}
                {result.note && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-semibold">ملاحظة:</span>
                    <span className="font-semibold text-orange-600">{result.note}</span>
                  </div>
                )}
                {result.markedAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-semibold">وقت التسجيل:</span>
                    <span className="font-mono text-gray-600 text-xs" dir="ltr">
                      {new Date(result.markedAt).toLocaleString('en-GB', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                      })}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={reset}
                className="flex items-center gap-2 text-sm text-primary font-bold hover:underline"
              >
                <FiRefreshCw className="w-4 h-4" /> تسجيل حضور آخر
              </button>
            </div>
          )}

          {/* ── ERROR ── */}
          {scanState === SCAN_STATE.ERROR && (
            <div className="flex flex-col items-center gap-5 py-4">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                <FiXCircle className="w-10 h-10 text-red-500" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-extrabold text-red-500 mb-2">فشل التسجيل</h2>
                <p className="text-sm text-gray-600 font-medium">{errorMsg}</p>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setScanState(SCAN_STATE.MANUAL)}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold hover:bg-red-600"
                >
                  <FiEdit className="w-4 h-4" /> إدخال يدوي
                </button>
                <button
                  onClick={reset}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold"
                >
                  <FiRefreshCw className="w-4 h-4" /> محاولة مجدداً
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions Card */}
        {scanState === SCAN_STATE.IDLE && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <h3 className="font-bold text-blue-700 mb-3 text-sm">📋 تعليمات تسجيل الحضور</h3>
            <ul className="space-y-2 text-sm text-blue-700 font-medium list-disc list-inside">
              <li><strong>مسح بالكاميرا:</strong> وجّه الكاميرا نحو رمز QR الذي يعرضه الأستاذ</li>
              <li><strong>إدخال يدوي:</strong> انسخ رمز QR والصقه مع رقم المحاضرة</li>
              <li>سيتم التسجيل تلقائياً عند التحقق من صحة البيانات</li>
              <li>لا يمكن تسجيل الحضور لنفس المحاضرة مرتين</li>
            </ul>
          </div>
        )}

        {/* Manual Mode Tips */}
        {scanState === SCAN_STATE.MANUAL && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-5">
            <h3 className="font-bold text-yellow-700 mb-2 text-sm">💡 كيف تحصل على البيانات؟</h3>
            <p className="text-xs text-yellow-700 mb-2">
              من صفحة توليد QR، يمكن للأستاذ نسخ البيانات بهذا التنسيق:
            </p>
            <code className="block bg-yellow-100 p-2 rounded text-xs font-mono break-all text-yellow-800" dir="ltr">
              {`{"token":"a1b2c3d4e5f6...","lectureId":1}`}
            </code>
            <button
              onClick={() => {
                copyToClipboard(`{"token":"مثال_للتجربة","lectureId":1}`);
              }}
              className="mt-2 text-xs text-yellow-700 underline"
            >
              نسخ مثال للتجربة
            </button>
          </div>
        )}
      </div>
    </div>
  );
}