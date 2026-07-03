import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { QRCodeSVG } from "qrcode.react";
import {
  FiZap,
  FiBook,
  FiList,
  FiClock,
  FiCheckCircle,
  FiCopy,
} from "react-icons/fi";
import { selectCurrentUser } from "../../store/slices/authSlice";
import { fetchCourses, selectCourses } from "../../store/slices/coursesSlice";
import {
  fetchLectures,
  selectLectures,
} from "../../store/slices/lecturesSlice";
import { qrService } from "../../store/services/qrService";

export default function GenerateQR() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const courses = useSelector(selectCourses);
  const lectures = useSelector(selectLectures);

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedLectureId, setSelectedLectureId] = useState("");
  const [expiresInMinutes, setExpiresInMinutes] = useState(15);

  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [copied, setCopied] = useState(false);

  // Fetch Instructor's Courses
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCourses({ instructorId: user.id, limit: 100 }));
    }
  }, [dispatch, user?.id]);

  // Fetch Lectures when Course is selected
  useEffect(() => {
    if (selectedCourseId) {
      dispatch(fetchLectures({ courseId: selectedCourseId, limit: 100 }));
      setSelectedLectureId("");
      setQrData(null);
    }
  }, [dispatch, selectedCourseId]);

  // Countdown Timer
  useEffect(() => {
    if (!qrData || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [qrData, timeLeft]);

  const openLectures = lectures.filter((l) => !l.isClosed);

  const handleGenerate = async () => {
    if (!selectedLectureId) {
      toast.error("يرجى اختيار المحاضرة أولاً");
      return;
    }
    setLoading(true);
    try {
      const res = await qrService.generateQr(
        selectedLectureId,
        expiresInMinutes,
      );
      setQrData(res.qr);

      const expiryTime = new Date(res.qr.expiresAt).getTime();
      const now = new Date().getTime();
      setTimeLeft(Math.floor((expiryTime - now) / 1000));

      toast.success(res.message || "تم توليد الرمز بنجاح");
    } catch (err) {
      toast.error(err.response?.data?.message || "فشل توليد رمز QR");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (seconds <= 0) return "منتهي الصلاحية";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleCopyData = () => {
    const dataToCopy = JSON.stringify({
      token: qrData.token,
      lectureId: qrData.lecture?.id,
    });
    navigator.clipboard.writeText(dataToCopy);
    setCopied(true);
    toast.success("تم نسخ بيانات QR");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">توليد رمز QR</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-soft border border-gray-100 p-6 space-y-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            <FiZap className="text-primary" /> إعدادات الـ QR
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                <FiBook className="text-gray-400" /> المادة
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- اختر المادة --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                <FiList className="text-gray-400" /> المحاضرة (المفتوحة فقط)
              </label>
              <select
                value={selectedLectureId}
                onChange={(e) => {
                  setSelectedLectureId(e.target.value);
                  setQrData(null);
                }}
                disabled={!selectedCourseId || openLectures.length === 0}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              >
                <option value="">-- اختر المحاضرة --</option>
                {openLectures.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title} -{" "}
                    {new Date(l.lectureDate).toLocaleDateString("en-GB")}
                  </option>
                ))}
              </select>
              {selectedCourseId && openLectures.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  لا توجد محاضرات مفتوحة لهذه المادة.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                <FiClock className="text-gray-400" /> مدة الصلاحية (بالدقائق)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={expiresInMinutes}
                onChange={(e) => setExpiresInMinutes(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !selectedLectureId}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition-all shadow-md shadow-primary/30 mt-6 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FiZap className="w-5 h-5" /> توليد الرمز
                </>
              )}
            </button>
          </div>
        </div>

        {/* QR Display */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-soft border border-gray-100 p-10 flex flex-col items-center justify-center text-center">
          {qrData ? (
            <div className="flex flex-col items-center animate-fade-in w-full">
              <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 mb-6">
                <QRCodeSVG
                  value={JSON.stringify({
                    token: qrData.token,
                    lectureId: qrData.lecture?.id,
                  })}
                  size={250}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                امسح الرمز لتسجيل الحضور
              </h2>
              <p className="text-gray-500 mb-6 font-medium">
                المحاضرة: {qrData.lecture?.title}
              </p>

              <div
                className={`px-6 py-3 rounded-full font-bold text-lg flex items-center gap-3 ${timeLeft > 0 ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-600"}`}
              >
                <FiClock className="w-5 h-5" />
                <span dir="ltr">{formatTime(timeLeft)}</span>
              </div>

              {/* ✅ قسم نسخ البيانات للإدخال اليدوي (للطلاب بدون كاميرا) */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center w-full">
                <p className="text-xs text-gray-500 mb-2">
                  📋 للطلاب بدون كاميرا، يمكن نسخ البيانات وإرسالها لهم:
                </p>
                <div className="flex items-center gap-2">
                  <code
                    className="flex-1 text-xs bg-gray-100 p-2 rounded font-mono break-all text-left"
                    dir="ltr"
                  >
                    {JSON.stringify({
                      token: qrData.token,
                      lectureId: qrData.lecture?.id,
                    })}
                  </code>
                  <button
                    onClick={handleCopyData}
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    <FiCopy
                      className={`w-4 h-4 inline ml-1 ${copied ? "text-green-600" : "text-gray-600"}`}
                    />
                    {copied ? "تم النسخ" : "نسخ"}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  يمكن للطالب لصق هذه البيانات في صفحة "إدخال يدوي" لتسجيل
                  الحضور
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="w-56 h-56 bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center mb-8 rounded-xl shadow-inner relative">
                <div className="absolute top-3 start-3 w-7 h-7 border-t-4 border-s-4 border-primary/60 rounded-tl-sm" />
                <div className="absolute top-3 end-3 w-7 h-7 border-t-4 border-e-4 border-primary/60 rounded-tr-sm" />
                <div className="absolute bottom-3 start-3 w-7 h-7 border-b-4 border-s-4 border-primary/60 rounded-bl-sm" />
                <div className="absolute bottom-3 end-3 w-7 h-7 border-b-4 border-e-4 border-primary/60 rounded-br-sm" />
                <FiCheckCircle className="w-10 h-10 text-gray-300" />
              </div>
              <p className="font-semibold text-gray-400">
                يرجى اختيار المادة والمحاضرة ثم النقر على "توليد الرمز"
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
