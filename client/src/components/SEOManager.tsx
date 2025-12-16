import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Globe,
  FileText,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  AlertTriangle,
  Edit2,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  Tag,
  Share2,
  Image,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SEOTag {
  id: string;
  page: string;
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  robots?: string;
  score: number;
  lastUpdated: string;
}

const GlassCard = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "relative rounded-2xl overflow-hidden",
      "bg-gradient-to-br from-slate-800/60 via-slate-900/80 to-slate-900/90",
      "backdrop-blur-xl border border-slate-700/50",
      "shadow-lg shadow-black/20",
      className
    )}
    {...props}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
    {children}
  </motion.div>
);

const SEOScoreBadge = ({ score }: { score: number }) => {
  const getScoreColor = () => {
    if (score >= 80) return "from-emerald-500 to-teal-500 text-emerald-400";
    if (score >= 60) return "from-amber-500 to-orange-500 text-amber-400";
    return "from-red-500 to-pink-500 text-red-400";
  };

  const getScoreLabel = () => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Work";
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg",
          "bg-gradient-to-br",
          getScoreColor().split(" ").slice(0, 2).join(" ")
        )}
      >
        {score}
      </div>
      <div>
        <p className={cn("font-semibold text-sm", getScoreColor().split(" ").pop())}>
          {getScoreLabel()}
        </p>
        <p className="text-xs text-slate-500">SEO Score</p>
      </div>
    </div>
  );
};

const AccordionItem = ({
  tag,
  isOpen,
  onToggle,
  onUpdate,
  onDelete,
}: {
  tag: SEOTag;
  isOpen: boolean;
  onToggle: () => void;
  onUpdate: (id: string, data: Partial<SEOTag>) => void;
  onDelete: (id: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(tag);

  const handleSave = () => {
    onUpdate(tag.id, formData);
    setEditing(false);
  };

  const getStatusIcon = () => {
    if (tag.score >= 80) return <Check className="w-4 h-4 text-emerald-400" />;
    if (tag.score >= 60) return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    return <X className="w-4 h-4 text-red-400" />;
  };

  return (
    <motion.div
      layout
      className={cn(
        "rounded-xl border overflow-hidden transition-all duration-300",
        isOpen
          ? "border-cyan-500/40 bg-slate-800/50"
          : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50"
      )}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left"
        data-testid={`accordion-toggle-${tag.id}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-medium text-white truncate">{tag.page}</p>
            <p className="text-xs text-slate-500 truncate">{tag.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {getStatusIcon()}
          <div
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              tag.score >= 80
                ? "bg-emerald-500/20 text-emerald-400"
                : tag.score >= 60
                ? "bg-amber-500/20 text-amber-400"
                : "bg-red-500/20 text-red-400"
            )}
          >
            {tag.score}/100
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 space-y-4 border-t border-slate-700/50 pt-4">
              <div className="flex items-center justify-between">
                <SEOScoreBadge score={tag.score} />
                <div className="flex items-center gap-2">
                  {editing ? (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm hover:bg-emerald-500/30 transition-colors"
                        data-testid={`button-save-${tag.id}`}
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setFormData(tag);
                          setEditing(false);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-400 text-sm hover:bg-slate-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/30 transition-colors"
                        data-testid={`button-edit-${tag.id}`}
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onDelete(tag.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-colors"
                        data-testid={`button-delete-${tag.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-400 mb-1.5">
                      <FileText className="w-4 h-4" />
                      Meta Title
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                        data-testid={`input-title-${tag.id}`}
                      />
                    ) : (
                      <p className="text-white text-sm p-2 rounded-lg bg-slate-900/30">
                        {tag.title}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      {tag.title.length}/60 characters
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-400 mb-1.5">
                      <Globe className="w-4 h-4" />
                      Meta Description
                    </label>
                    {editing ? (
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                        data-testid={`input-description-${tag.id}`}
                      />
                    ) : (
                      <p className="text-white text-sm p-2 rounded-lg bg-slate-900/30 min-h-[60px]">
                        {tag.description}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      {tag.description.length}/160 characters
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-400 mb-1.5">
                      <Tag className="w-4 h-4" />
                      Keywords
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.keywords.join(", ")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            keywords: e.target.value.split(",").map((k) => k.trim()),
                          })
                        }
                        placeholder="keyword1, keyword2, keyword3"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                        data-testid={`input-keywords-${tag.id}`}
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {tag.keywords.map((keyword, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-400 mb-1.5">
                      <Share2 className="w-4 h-4" />
                      OG Title (Social Share)
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.ogTitle || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, ogTitle: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                        data-testid={`input-og-title-${tag.id}`}
                      />
                    ) : (
                      <p className="text-white text-sm p-2 rounded-lg bg-slate-900/30">
                        {tag.ogTitle || "Not set"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-400 mb-1.5">
                      <Image className="w-4 h-4" />
                      OG Image URL
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.ogImage || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, ogImage: e.target.value })
                        }
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                        data-testid={`input-og-image-${tag.id}`}
                      />
                    ) : (
                      <p className="text-white text-sm p-2 rounded-lg bg-slate-900/30 truncate">
                        {tag.ogImage || "Not set"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-400 mb-1.5">
                      <Link2 className="w-4 h-4" />
                      Canonical URL
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.canonicalUrl || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, canonicalUrl: e.target.value })
                        }
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                        data-testid={`input-canonical-${tag.id}`}
                      />
                    ) : (
                      <p className="text-white text-sm p-2 rounded-lg bg-slate-900/30 truncate">
                        {tag.canonicalUrl || "Not set"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-400 mb-1.5">
                      <Search className="w-4 h-4" />
                      Robots Directive
                    </label>
                    {editing ? (
                      <select
                        value={formData.robots || "index, follow"}
                        onChange={(e) =>
                          setFormData({ ...formData, robots: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                        data-testid={`select-robots-${tag.id}`}
                      >
                        <option value="index, follow">Index, Follow</option>
                        <option value="noindex, follow">No Index, Follow</option>
                        <option value="index, nofollow">Index, No Follow</option>
                        <option value="noindex, nofollow">No Index, No Follow</option>
                      </select>
                    ) : (
                      <p className="text-white text-sm p-2 rounded-lg bg-slate-900/30">
                        {tag.robots || "index, follow"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Last updated: {tag.lastUpdated}</span>
                <a
                  href={tag.page}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  View page <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export function SEOManager() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const [seoTags, setSeoTags] = useState<SEOTag[]>([
    {
      id: "1",
      page: "/",
      title: "ORBIT Staffing OS - Automated Staffing Platform",
      description:
        "Transform your staffing agency with ORBIT's automated platform. End-to-end solutions for recruitment, payroll, and workforce management.",
      keywords: ["staffing software", "workforce management", "temp staffing", "payroll automation"],
      ogTitle: "ORBIT Staffing OS",
      ogDescription: "The future of staffing automation",
      ogImage: "/og-image.png",
      canonicalUrl: "https://orbitstaffing.io",
      robots: "index, follow",
      score: 92,
      lastUpdated: "Dec 15, 2025",
    },
    {
      id: "2",
      page: "/franchise",
      title: "Franchise Opportunities - ORBIT Staffing",
      description:
        "Join the ORBIT franchise network. Exclusive territory rights, full training, and ongoing support for your staffing business.",
      keywords: ["staffing franchise", "business opportunity", "franchise investment"],
      ogTitle: "Own Your Territory with ORBIT",
      score: 78,
      lastUpdated: "Dec 14, 2025",
    },
    {
      id: "3",
      page: "/pricing",
      title: "Pricing Plans - ORBIT Staffing OS",
      description:
        "Flexible pricing for staffing agencies of all sizes. Start free, scale as you grow.",
      keywords: ["staffing software pricing", "subscription plans"],
      score: 65,
      lastUpdated: "Dec 10, 2025",
    },
    {
      id: "4",
      page: "/worker-portal",
      title: "Worker Portal - ORBIT",
      description: "Access your shifts, timecards, and pay information.",
      keywords: ["worker portal", "timecard"],
      score: 45,
      lastUpdated: "Nov 28, 2025",
    },
  ]);

  const handleUpdate = (id: string, data: Partial<SEOTag>) => {
    setSeoTags((tags) =>
      tags.map((tag) =>
        tag.id === id
          ? { ...tag, ...data, lastUpdated: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }
          : tag
      )
    );
  };

  const handleDelete = (id: string) => {
    setSeoTags((tags) => tags.filter((tag) => tag.id !== id));
    if (openId === id) setOpenId(null);
  };

  const filteredTags = seoTags.filter(
    (tag) =>
      tag.page.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const avgScore = Math.round(seoTags.reduce((sum, t) => sum + t.score, 0) / seoTags.length);

  return (
    <div className="p-6 space-y-6" data-testid="seo-manager">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent"
          >
            SEO Manager
          </motion.h1>
          <p className="text-slate-400 mt-1">Manage meta tags and optimize search visibility</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
          data-testid="button-add-seo-tag"
        >
          <Plus className="w-4 h-4" />
          Add Page
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{seoTags.length}</p>
              <p className="text-sm text-slate-400">Pages Tracked</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-3 rounded-xl bg-gradient-to-br",
                avgScore >= 80
                  ? "from-emerald-500 to-teal-600"
                  : avgScore >= 60
                  ? "from-amber-500 to-orange-600"
                  : "from-red-500 to-pink-600"
              )}
            >
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{avgScore}</p>
              <p className="text-sm text-slate-400">Average SEO Score</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
              <Tag className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {seoTags.reduce((sum, t) => sum + t.keywords.length, 0)}
              </p>
              <p className="text-sm text-slate-400">Total Keywords</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Page SEO Tags</h3>
          </div>
          <div className="flex-1 sm:max-w-xs ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
                data-testid="input-search-seo"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {filteredTags.map((tag) => (
            <AccordionItem
              key={tag.id}
              tag={tag}
              isOpen={openId === tag.id}
              onToggle={() => setOpenId(openId === tag.id ? null : tag.id)}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
          {filteredTags.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No pages found matching your search</p>
            </div>
          )}
        </div>
      </GlassCard>

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 p-6 shadow-xl"
            >
              <h3 className="text-xl font-bold text-white mb-4">Add New Page</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const newTag: SEOTag = {
                    id: Date.now().toString(),
                    page: formData.get("page") as string,
                    title: formData.get("title") as string,
                    description: formData.get("description") as string,
                    keywords: (formData.get("keywords") as string).split(",").map((k) => k.trim()),
                    score: 50,
                    lastUpdated: new Date().toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }),
                  };
                  setSeoTags([...seoTags, newTag]);
                  setShowAddModal(false);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Page Path</label>
                  <input
                    type="text"
                    name="page"
                    required
                    placeholder="/example-page"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                    data-testid="input-new-page-path"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Meta Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="Page Title - ORBIT"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                    data-testid="input-new-title"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Meta Description</label>
                  <textarea
                    name="description"
                    required
                    rows={3}
                    placeholder="A brief description of the page..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none resize-none"
                    data-testid="input-new-description"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Keywords</label>
                  <input
                    type="text"
                    name="keywords"
                    placeholder="keyword1, keyword2, keyword3"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                    data-testid="input-new-keywords"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                    data-testid="button-submit-new-page"
                  >
                    Add Page
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SEOManager;
