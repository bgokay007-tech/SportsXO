import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import { setPosts, togglePostLike, addPost } from '../store/slices/postSlice';
import api from '../services/api';

function FeedPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const posts = useSelector(state => state.posts.posts);
    const [newPost, setNewPost] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const { data } = await api.get('/posts/feed');
                dispatch(setPosts(data));
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFeed();
    }, [dispatch]);

    const handlePost = async (e) => {
        e.preventDefault();
        if (!newPost.trim()) return;
        setIsPosting(true);
        try {
            const { data } = await api.post('/posts', { content: newPost });
            dispatch(addPost(data));
            setNewPost('');
        } catch (err) {
            console.error(err);
        } finally {
            setIsPosting(false);
        }
    };

    const handleLike = async (postId) => {
        try {
            dispatch(togglePostLike(postId));
            await api.post(`/posts/${postId}/like`);
        } catch {
            dispatch(togglePostLike(postId));
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-950">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/tournaments')}
                    className="text-gray-400 hover:text-white text-sm transition"
                >
                    🏆 Tournaments
                </button>
                <button
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-white text-sm transition"
                >
                    Logout
                </button>
            </div>
            <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-white">
                        Sports<span className="text-purple-500">XO</span>
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="text-gray-400 hover:text-white text-sm transition"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
                {/* Post oluştur */}
                <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                    <form onSubmit={handlePost} className="space-y-3">
                        <textarea
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            placeholder="What's happening in your sport? ⚽🏀🎾"
                            className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-purple-500 resize-none"
                            rows={3}
                        />
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isPosting || !newPost.trim()}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2 rounded-full transition disabled:opacity-50"
                            >
                                {isPosting ? 'Posting...' : 'Post'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Posts */}
                {isLoading ? (
                    <div className="text-center text-gray-400 py-8">Loading feed...</div>
                ) : posts.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                        No posts yet. Follow some athletes! 🏆
                    </div>
                ) : (
                    posts.map(post => (
                        <div key={post.id} className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                            {/* User info */}
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                    {post.user?.username?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-white font-semibold">{post.user?.fullName}</p>
                                    <p className="text-gray-400 text-sm">@{post.user?.username} · {post.user?.profile?.sport}</p>
                                </div>
                            </div>

                            {/* Content */}
                            <p className="text-white mb-4">{post.content}</p>

                            {/* Actions */}
                            <div className="flex items-center gap-6 text-gray-400">
                                <button
                                    onClick={() => handleLike(post.id)}
                                    className={`flex items-center gap-2 hover:text-red-400 transition ${post.isLiked ? 'text-red-400' : ''}`}
                                >
                                    {post.isLiked ? '❤️' : '🤍'} {post._count?.likes}
                                </button>
                                <span className="flex items-center gap-2">
                                    💬 {post._count?.comments}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default FeedPage;