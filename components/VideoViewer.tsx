import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface VideoViewerProps {
  videoUrl: string | null;
  onClose: () => void;
}

const VideoViewer: React.FC<VideoViewerProps> = ({ videoUrl, onClose }) => {
  useEffect(() => {
    if (!videoUrl) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [videoUrl, onClose]);

  const isYouTube = videoUrl?.includes('youtube.com') || videoUrl?.includes('youtu.be');

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1].split('?')[0];
      const params = url.split('?')[1] || '';
      // Convert start time (?t=77) to start=77 for YouTube Embed
      const start = params.match(/t=(\d+)/)?.[1] || '';
      return `https://www.youtube.com/embed/${id}?autoplay=1${start ? `&start=${start}` : ''}`;
    }
    if (url.includes('v=')) {
      const id = url.split('v=')[1].split('&')[0];
      const start = url.match(/[?&]t=(\d+)/)?.[1] || '';
      return `https://www.youtube.com/embed/${id}?autoplay=1${start ? `&start=${start}` : ''}`;
    }
    return url;
  };

  return (
    <AnimatePresence>
      {videoUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 md:p-10"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-md text-white transition-all z-50 group"
              aria-label="Cerrar video"
            >
              <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {isYouTube ? (
              <iframe
                src={getEmbedUrl(videoUrl)}
                title="YouTube Video"
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <video
                src={videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              >
                Tu navegador no soporta la etiqueta de video.
              </video>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoViewer;