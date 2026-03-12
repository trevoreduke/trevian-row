"use client";
import { useState, useEffect, useCallback } from "react";
import AppShell from "@/components/AppShell";
import { useAuth, User } from "@/lib/useAuth";

interface Post {
  id: number;
  author_name: string;
  author_photo: string | null;
  type: string;
  title: string | null;
  body: string | null;
  image_url: string | null;
  created_at: string;
  reactions: { emoji: string; user_id: number; user_name: string }[];
}

const typeLabels: Record<string, { label: string; color: string }> = {
  result: { label: "Race Result", color: "bg-green-100 text-green-800" },
  pr: { label: "New PR!", color: "bg-yellow-100 text-yellow-800" },
  photo: { label: "Photos", color: "bg-purple-100 text-purple-800" },
  shoutout: { label: "Shoutout", color: "bg-pink-100 text-pink-800" },
  update: { label: "Update", color: "bg-blue-100 text-blue-800" },
};

const emojis = ["🔥", "💪", "🚣", "🏆", "👏"];

function PostCard({ post, user, onReact }: { post: Post; user: User; onReact: () => void }) {
  const [reacting, setReacting] = useState(false);
  const typeInfo = typeLabels[post.type] || typeLabels.update;

  // Group reactions by emoji
  const grouped = post.reactions.reduce((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = [];
    acc[r.emoji].push(r);
    return acc;
  }, {} as Record<string, typeof post.reactions>);

  async function react(emoji: string) {
    setReacting(true);
    await fetch("/api/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: post.id, emoji }),
    });
    setReacting(false);
    onReact();
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-white font-bold text-sm">
            {post.author_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900 text-sm">{post.author_name}</div>
            <div className="text-xs text-gray-500">
              {new Date(post.created_at).toLocaleDateString("en-US", {
                month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
              })}
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
            {typeInfo.label}
          </span>
        </div>

        {post.title && <h3 className="font-bold text-gray-900 mb-1">{post.title}</h3>}
        {post.body && <p className="text-gray-700 text-sm whitespace-pre-wrap">{post.body}</p>}
        {post.image_url && (
          <img src={post.image_url} alt="" className="mt-3 rounded-xl w-full object-cover max-h-80" />
        )}
      </div>

      <div className="px-4 pb-3 flex items-center gap-1 flex-wrap">
        {Object.entries(grouped).map(([emoji, reactions]) => {
          const myReaction = reactions.some(r => r.user_id === user.id);
          return (
            <button
              key={emoji}
              onClick={() => react(emoji)}
              disabled={reacting}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm transition-colors ${
                myReaction ? "bg-blue-100 border border-blue-300" : "bg-gray-100 border border-transparent"
              }`}
            >
              {emoji} <span className="text-xs font-medium">{reactions.length}</span>
            </button>
          );
        })}
        <div className="flex gap-0.5 ml-auto">
          {emojis.filter(e => !grouped[e]).map(emoji => (
            <button
              key={emoji}
              onClick={() => react(emoji)}
              disabled={reacting}
              className="p-1.5 rounded-full hover:bg-gray-100 text-sm opacity-40 hover:opacity-100 transition-opacity"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function NewPostForm({ onPost }: { onPost: () => void }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("update");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPosting(true);
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, title: title || null, body }),
    });
    setPosting(false);
    setOpen(false);
    setTitle("");
    setBody("");
    setType("update");
    onPost();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-left text-gray-400 hover:border-blue-300 transition-colors"
      >
        Post an update, result, or shoutout...
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
      <div className="flex gap-2 flex-wrap">
        {Object.entries(typeLabels).map(([key, { label, color }]) => (
          <button
            key={key}
            type="button"
            onClick={() => setType(key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              type === key ? color + " ring-2 ring-blue-400" : "bg-gray-100 text-gray-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <input
        type="text"
        placeholder="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
      />
      <textarea
        placeholder="What's happening?"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
        required
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={posting}
          className="flex-1 py-2 bg-blue-900 text-white font-bold rounded-xl text-sm hover:bg-blue-800 disabled:opacity-50"
        >
          {posting ? "Posting..." : "Post"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 text-gray-500 text-sm hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/posts");
    if (res.ok) {
      const data = await res.json();
      setPosts(data.posts);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const canPost = user && (user.role === "coach" || user.role === "coxswain");

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-gray-900">Hype Board</h1>
          <span className="text-2xl">🚣</span>
        </div>
        {canPost && <NewPostForm onPost={load} />}
        {posts.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">📣</div>
            <p>No posts yet. Be the first!</p>
          </div>
        )}
        {user && posts.map((post) => (
          <PostCard key={post.id} post={post} user={user} onReact={load} />
        ))}
      </div>
    </AppShell>
  );
}
