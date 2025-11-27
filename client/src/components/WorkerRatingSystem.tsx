import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare,
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Building2,
  Calendar,
  BarChart3
} from 'lucide-react';

interface Rating {
  id: string;
  workerId: string;
  workerName: string;
  clientId: string;
  clientName: string;
  jobOrder: string;
  shiftDate: string;
  rating: number;
  categories: {
    punctuality: number;
    quality: number;
    attitude: number;
    safety: number;
    teamwork: number;
  };
  comment: string;
  ratedBy: 'client' | 'worker';
  status: 'pending' | 'published';
  createdAt: string;
}

const mockRatings: Rating[] = [
  {
    id: 'R-001',
    workerId: 'W-001',
    workerName: 'John Smith',
    clientId: 'C-001',
    clientName: 'Acme Warehousing',
    jobOrder: 'JO-001',
    shiftDate: '2025-11-25',
    rating: 4.8,
    categories: {
      punctuality: 5,
      quality: 5,
      attitude: 5,
      safety: 4,
      teamwork: 5
    },
    comment: 'Excellent worker! Always on time and very professional. Great attitude and team player.',
    ratedBy: 'client',
    status: 'published',
    createdAt: '2025-11-26T09:00:00Z'
  },
  {
    id: 'R-002',
    workerId: 'W-002',
    workerName: 'Maria Garcia',
    clientId: 'C-001',
    clientName: 'Acme Warehousing',
    jobOrder: 'JO-001',
    shiftDate: '2025-11-24',
    rating: 4.9,
    categories: {
      punctuality: 5,
      quality: 5,
      attitude: 5,
      safety: 5,
      teamwork: 4
    },
    comment: 'Outstanding performance. Very detail-oriented and follows safety protocols perfectly.',
    ratedBy: 'client',
    status: 'published',
    createdAt: '2025-11-25T14:30:00Z'
  },
  {
    id: 'R-003',
    workerId: 'W-003',
    workerName: 'David Johnson',
    clientId: 'C-002',
    clientName: 'Event Solutions LLC',
    jobOrder: 'JO-002',
    shiftDate: '2025-11-23',
    rating: 4.7,
    categories: {
      punctuality: 5,
      quality: 4,
      attitude: 5,
      safety: 5,
      teamwork: 5
    },
    comment: 'Great team member for event setup. Customer service skills were excellent.',
    ratedBy: 'client',
    status: 'published',
    createdAt: '2025-11-24T10:15:00Z'
  }
];

const mockWorkerStats = {
  totalRatings: 34,
  averageRating: 4.8,
  fiveStarCount: 28,
  fourStarCount: 5,
  threeStarCount: 1,
  twoStarCount: 0,
  oneStarCount: 0,
  categories: {
    punctuality: 4.9,
    quality: 4.7,
    attitude: 4.8,
    safety: 4.9,
    teamwork: 4.7
  },
  badges: ['Top Performer', 'Safety Champion', 'Perfect Attendance']
};

export function WorkerRatingSystem() {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'submit-rating'>('overview');
  const [newRating, setNewRating] = useState({
    workerId: '',
    rating: 5,
    categories: {
      punctuality: 5,
      quality: 5,
      attitude: 5,
      safety: 5,
      teamwork: 5
    },
    comment: ''
  });

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6';
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderCategoryStars = (category: string, value: number, onChange?: (value: number) => void) => {
    return (
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-300 font-medium capitalize">{category}</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => onChange?.(star)}
              className="focus:outline-none"
              data-testid={`rating-${category}-${star}`}
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  star <= value
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-600 hover:text-gray-500'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
          Worker Rating & Review System
        </h2>
        <p className="text-gray-400">Post-shift ratings, performance tracking, and quality assurance</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-700 pb-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="tab-rating-overview"
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeTab === 'reviews'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="tab-all-reviews"
        >
          <MessageSquare className="w-4 h-4 inline mr-2" />
          All Reviews ({mockRatings.length})
        </button>
        <button
          onClick={() => setActiveTab('submit-rating')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeTab === 'submit-rating'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="tab-submit-rating"
        >
          <Star className="w-4 h-4 inline mr-2" />
          Submit Rating
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                <span className="text-3xl font-bold text-white">{mockWorkerStats.averageRating}</span>
              </div>
              <p className="text-gray-400 text-sm">Average Rating</p>
              <p className="text-xs text-gray-500 mt-1">{mockWorkerStats.totalRatings} reviews</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <ThumbsUp className="w-8 h-8 text-green-400" />
                <span className="text-3xl font-bold text-white">{mockWorkerStats.fiveStarCount}</span>
              </div>
              <p className="text-gray-400 text-sm">5-Star Reviews</p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((mockWorkerStats.fiveStarCount / mockWorkerStats.totalRatings) * 100)}% of total
              </p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-8 h-8 text-purple-400" />
                <span className="text-3xl font-bold text-white">{mockWorkerStats.badges.length}</span>
              </div>
              <p className="text-gray-400 text-sm">Badges Earned</p>
              <p className="text-xs text-gray-500 mt-1">Performance achievements</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-8 h-8 text-cyan-400" />
                <span className="text-3xl font-bold text-white">+0.3</span>
              </div>
              <p className="text-gray-400 text-sm">30-Day Trend</p>
              <p className="text-xs text-green-400 mt-1">↑ Rating improving</p>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-white">Rating Distribution</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = stars === 5 ? mockWorkerStats.fiveStarCount :
                             stars === 4 ? mockWorkerStats.fourStarCount :
                             stars === 3 ? mockWorkerStats.threeStarCount :
                             stars === 2 ? mockWorkerStats.twoStarCount :
                             mockWorkerStats.oneStarCount;
                const percentage = (count / mockWorkerStats.totalRatings) * 100;
                
                return (
                  <div key={stars} className="flex items-center gap-4">
                    <div className="flex items-center gap-1 w-24">
                      <span className="text-white font-bold">{stars}</span>
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    </div>
                    <div className="flex-1 bg-slate-700 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-yellow-400 h-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-white font-bold w-12 text-right">{count}</span>
                    <span className="text-gray-400 text-sm w-12 text-right">{Math.round(percentage)}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-white">Performance Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(mockWorkerStats.categories).map(([category, rating]) => (
                <div key={category} className="flex items-center justify-between p-4 bg-slate-700/50 rounded">
                  <div>
                    <p className="text-white font-bold capitalize mb-1">{category}</p>
                    {renderStars(Math.round(rating), 'sm')}
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-cyan-400">{rating}</span>
                    <p className="text-xs text-gray-400">/ 5.0</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-purple-400" />
              Performance Badges
            </h3>
            <div className="flex gap-4">
              {mockWorkerStats.badges.map((badge, idx) => (
                <div key={idx} className="bg-gradient-to-br from-purple-900/50 to-cyan-900/50 border border-purple-500/50 rounded-lg p-4 text-center">
                  <Award className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-white font-bold text-sm">{badge}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {mockRatings.map((rating) => (
            <div key={rating.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-4">
                  <div className="bg-cyan-900/30 p-3 rounded-full">
                    <User className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{rating.workerName}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                      <Building2 className="w-4 h-4" />
                      <span>{rating.clientName}</span>
                      <span>•</span>
                      <span className="font-mono">{rating.jobOrder}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                      <Calendar className="w-4 h-4" />
                      <span>{rating.shiftDate}</span>
                      <span>•</span>
                      <span className="text-xs">Rated by {rating.ratedBy === 'client' ? 'Client' : 'Worker'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    {renderStars(Math.round(rating.rating), 'md')}
                    <span className="text-2xl font-bold text-yellow-400">{rating.rating}</span>
                  </div>
                  <p className="text-xs text-gray-400">{new Date(rating.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Category Ratings */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 p-4 bg-slate-700/30 rounded">
                {Object.entries(rating.categories).map(([category, score]) => (
                  <div key={category} className="text-center">
                    <p className="text-xs text-gray-400 mb-1 capitalize">{category}</p>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-white font-bold">{score}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment */}
              {rating.comment && (
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-gray-300 italic">"{rating.comment}"</p>
                </div>
              )}

              {/* Status Badge */}
              <div className="mt-4">
                {rating.status === 'published' ? (
                  <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full">
                    <CheckCircle className="w-3 h-3 inline mr-1" />
                    Published
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-yellow-600 text-white text-xs rounded-full">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Pending Review
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Rating Tab */}
      {activeTab === 'submit-rating' && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-2xl font-bold mb-6 text-white">Submit Worker Rating</h3>
          <form className="space-y-6">
            {/* Worker Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Select Worker *</label>
              <select
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                data-testid="select-worker"
                onChange={(e) => setNewRating({ ...newRating, workerId: e.target.value })}
              >
                <option value="">Choose a worker...</option>
                <option value="W-001">John Smith - Warehouse Worker</option>
                <option value="W-002">Maria Garcia - Warehouse Worker</option>
                <option value="W-003">David Johnson - Event Staff</option>
              </select>
            </div>

            {/* Overall Rating */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3">Overall Rating *</label>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating({ ...newRating, rating: star })}
                    className="focus:outline-none"
                    data-testid={`overall-rating-${star}`}
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${
                        star <= newRating.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-600 hover:text-gray-500'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-3xl font-bold text-yellow-400 ml-4">{newRating.rating}.0</span>
              </div>
            </div>

            {/* Category Ratings */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3">Category Ratings *</label>
              <div className="bg-slate-700/30 rounded-lg p-4">
                {Object.entries(newRating.categories).map(([category, value]) => 
                  renderCategoryStars(
                    category, 
                    value, 
                    (newValue) => setNewRating({
                      ...newRating,
                      categories: { ...newRating.categories, [category]: newValue }
                    })
                  )
                )}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Comments</label>
              <textarea
                rows={4}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                placeholder="Share your experience with this worker (optional but encouraged)..."
                data-testid="textarea-rating-comment"
                onChange={(e) => setNewRating({ ...newRating, comment: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Your feedback helps maintain quality standards and recognize top performers.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button 
                type="submit" 
                className="bg-cyan-600 hover:bg-cyan-700"
                data-testid="button-submit-rating"
              >
                <Star className="w-4 h-4 mr-2" />
                Submit Rating
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setActiveTab('overview')}
                data-testid="button-cancel-rating"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
