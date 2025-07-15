import React from "react";
import {
  X,
  Calendar,
  Clock,
  Eye,
  Share2,
  MessageCircle,
  Heart,
  Bookmark,
} from "lucide-react";
import Image from "next/image";

const ArticleDetail = ({
  article = {},
  comments = {},
  newComment,
  setNewComment,
  handleCommentSubmit,
  user,
  onClose,
}) => {
  const {
    thumbnail = "/default-thumbnail.jpg",
    title = "Untitled",
    author = "Unknown Author",
    date,
    views = 0,
    readTime = "1 min",
    content = "",
    id,
  } = article;

  const formattedDate = date
    ? new Date(date).toLocaleDateString()
    : "Unknown Date";
  const formattedViews =
    typeof views === "number" ? views.toLocaleString() : "0";

  return (
    <div className="max-w-5xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
      {/* Header Image & Author Info */}
      <div className="relative h-80 overflow-hidden">
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover"
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <button
          onClick={onClose}
          className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-200 shadow-lg"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="flex items-center justify-between mb-4">
            {/* Author Info */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg">
                {author?.charAt?.(0) || "A"}
              </div>
              <div>
                <p className="font-semibold text-lg">{author}</p>
                <div className="flex items-center text-white/80 text-sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formattedDate}
                  <Clock className="w-4 h-4 ml-4 mr-1" />
                  {readTime}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/30 transition-all duration-200">
                <Heart className="w-5 h-5" />
                <span>Like</span>
              </button>
              <button className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/30 transition-all duration-200">
                <Bookmark className="w-5 h-5" />
                <span>Save</span>
              </button>
              <button className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/30 transition-all duration-200">
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>
              <span className="flex items-center text-white/80 text-sm">
                <Eye className="w-4 h-4 mr-1" />
                {formattedViews}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="p-8 md:p-12">
        <div
          className="prose prose-lg max-w-none mb-12 text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Comments Section */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
            <MessageCircle className="w-6 h-6 mr-3 text-purple-600" />
            Comments ({(comments?.[id] || []).length})
          </h3>

          {/* Comment Input */}
          {user && (
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl">
              <div className="flex items-start space-x-4">
                <Image
                  src={user.avatar || "/default-avatar.png"}
                  alt={user.name || "User"}
                  fill
                  className="rounded-full ring-2 ring-white shadow-lg object-cover"
                  sizes="48px"
                />
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 backdrop-blur-sm"
                    rows="4"
                  />
                  <button
                    onClick={() => handleCommentSubmit(id)}
                    className="mt-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
                  >
                    Post Comment
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Render Comments */}
          <div className="space-y-6">
            {(comments?.[id] || []).map((comment) => (
              <div
                key={comment.id}
                className="flex items-start space-x-4 bg-gray-50 p-6 rounded-2xl"
              >
                <Image
                  src={comment.avatar || "/default-avatar.png"}
                  alt={comment.user || "User"}
                  fill
                  className="rounded-full ring-2 ring-white shadow-lg object-cover"
                  sizes="48px"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-800">
                      {comment.user || "Anonymous"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {comment.timestamp
                        ? new Date(comment.timestamp).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {comment.content || ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
