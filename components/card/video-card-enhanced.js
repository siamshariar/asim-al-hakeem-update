import { Calendar, Eye, Play } from 'lucide-react';
import { date, youtubeViews } from '../../lib/format';

export default function VideoCardEnhanced({ video, views, onClick }) {
  const id = video?.id;
  const image = video?.image || `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
  const title = video?.title || '';
  const publishedAt = date(video?.date);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer text-left"
    >
      <div className="relative h-40 sm:h-44 lg:h-48 overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={title || 'YouTube Video'}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="eager"
        />

        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#10b981] rounded-full flex items-center justify-center shadow-lg">
            <Play size={18} className="text-white" fill="white" />
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-[#1a1f2e] text-sm sm:text-base line-clamp-2 text-left group-hover:text-[#10b981] transition-colors">
            {title}
          </h3>
        </div>
        <div className="flex justify-between items-center text-xs sm:text-sm text-gray-500">
          <span>{youtubeViews(views)} views</span>
          <span>{publishedAt}</span>
        </div>
      </div>
    </button>
  );
}
