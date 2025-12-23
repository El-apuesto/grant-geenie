import { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
  description?: string;
  onClose?: () => void;
  standalone?: boolean;
}

export default function PDFViewer({ 
  pdfUrl, 
  title, 
  description, 
  onClose,
  standalone = false 
}: PDFViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (standalone) {
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <FileText className="w-8 h-8 text-emerald-500" />
              {title}
            </h1>
            {description && (
              <p className="text-slate-400 text-lg">{description}</p>
            )}
          </div>

          {/* Toolbar */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-4 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-white font-medium px-3">{zoom}%</span>
              <button
                onClick={handleZoomIn}
                className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous Page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-white font-medium px-3">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next Page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
          </div>

          {/* PDF Container */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div 
              className="bg-white rounded overflow-auto" 
              style={{ 
                height: 'calc(100vh - 300px)',
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease'
              }}
            >
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title={title}
                style={{ minHeight: '800px' }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-emerald-500" />
              {title}
            </h2>
            {description && (
              <p className="text-slate-400 text-sm mt-1">{description}</p>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-white font-medium px-3">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download
          </button>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-auto p-4">
          <div 
            className="bg-white rounded mx-auto" 
            style={{ 
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease',
              width: '100%',
              minHeight: '100%'
            }}
          >
            <iframe
              src={pdfUrl}
              className="w-full border-0"
              title={title}
              style={{ minHeight: '800px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}