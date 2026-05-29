import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function AthleteCard({ card, profile, user }) {
    const levelColors = {
        BRONZE: 'from-amber-700 to-amber-500',
        SILVER: 'from-gray-400 to-gray-300',
        GOLD: 'from-yellow-500 to-yellow-300',
        PLATINUM: 'from-cyan-400 to-blue-400',
        LEGEND: 'from-purple-600 to-pink-500',
    };

    const levelGlow = {
        BRONZE: 'shadow-amber-500/50',
        SILVER: 'shadow-gray-400/50',
        GOLD: 'shadow-yellow-400/50',
        PLATINUM: 'shadow-cyan-400/50',
        LEGEND: 'shadow-purple-500/50',
    };

    const level = card?.cardLevel || 'BRONZE';

    return (
        <div className={`relative w-64 rounded-2xl overflow-hidden shadow-2xl ${levelGlow[level]} border border-white/20`}>
            {/* Kart arka planı */}
            <div className={`bg-gradient-to-b ${levelColors[level]} p-1`}>
                <div className="bg-gray-900 rounded-xl overflow-hidden">
                    {/* Kart başlığı */}
                    <div className={`bg-gradient-to-r ${levelColors[level]} px-4 py-2 flex justify-between items-center`}>
                        <span className="text-white font-bold text-sm">{level}</span>
                        <span className="text-white text-xs">⚡ {card?.power || 0}</span>
                    </div>

                    {/* Avatar */}
                    <div className="flex justify-center py-4 bg-gray-800">
                        <div className={`w-24 h-24 rounded-full bg-gradient-to-b ${levelColors[level]} flex items-center justify-center text-4xl font-bold text-white shadow-lg`}>
                            {user?.username?.[0]?.toUpperCase()}
                        </div>
                    </div>

                    {/* İsim */}
                    <div className="text-center py-2 bg-gray-900">
                        <p className="text-white font-bold text-lg">{user?.fullName}</p>
                        <p className="text-gray-400 text-sm">@{user?.username}</p>
                        <p className={`text-sm font-semibold bg-gradient-to-r ${levelColors[level]} bg-clip-text text-transparent`}>
                            {profile?.sport?.toUpperCase()} · {profile?.level}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 p-3 bg-gray-800">
                        {[
                            { label: 'PWR', value: card?.power || 0 },
                            { label: 'SPD', value: card?.speed || 0 },
                            { label: 'TEC', value: card?.technique || 0 },
                            { label: 'STA', value: card?.stamina || 0 },
                        ].map(stat => (
                            <div key={stat.label} className="bg-gray-900 rounded-lg p-2">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-gray-400 text-xs">{stat.label}</span>
                                    <span className="text-white text-xs font-bold">{stat.value}</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-1.5">
                                    <div
                                        className={`bg-gradient-to-r ${levelColors[level]} h-1.5 rounded-full`}
                                        style={{ width: `${stat.value}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* W/L/D */}
                    <div className="grid grid-cols-3 text-center py-3 bg-gray-900 border-t border-gray-800">
                        <div>
                            <p className="text-green-400 font-bold">{profile?.wins || 0}</p>
                            <p className="text-gray-500 text-xs">WIN</p>
                        </div>
                        <div>
                            <p className="text-red-400 font-bold">{profile?.losses || 0}</p>
                            <p className="text-gray-500 text-xs">LOSS</p>
                        </div>
                        <div>
                            <p className="text-yellow-400 font-bold">{profile?.draws || 0}</p>
                            <p className="text-gray-500 text-xs">DRAW</p>
                        </div>
                    </div>

                    {/* Points */}
                    <div className={`bg-gradient-to-r ${levelColors[level]} py-2 text-center`}>
                        <span className="text-white font-bold text-sm">
                            ⭐ {profile?.totalPoints || 0} POINTS
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProfilePage() {
    const { username } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const [userRes, postsRes] = await Promise.all([
                    api.get(`/users/${username}`),
                    api.get(`/posts/user/${username}`),
                ]);
                setUser(userRes.data);
                setPosts(postsRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [username]);

    const handleFollow = async () => {
        try {
            if (isFollowing) {
                await api.delete(`/users/${user.id}/follow`);
            } else {
                await api.post(`/users/${user.id}/follow`);
            }
            setIsFollowing(!isFollowing);
        } catch (err) {
            console.error(err);
        }
    };

    const handleMatchRequest = async () => {
        try {
            await api.post('/matches', {
                receiverId: user.id,
                sport: user.profile?.sport,
                message: `Hey ${user.username}! Let's play a match! 🏆`,
            });
            alert('Match request sent! 🎯');
        } catch (err) {
            alert(err.response?.data?.message || 'Error sending request');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <p className="text-white text-xl">Loading profile...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <p className="text-white text-xl">User not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950">
            {/* Navbar */}
            <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white">
                        ← Back
                    </button>
                    <h1 className="text-2xl font-bold text-white">
                        Sports<span className="text-purple-500">XO</span>
                    </h1>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sol — Kart */}
                    <div className="flex flex-col items-center gap-4">
                        <AthleteCard
                            card={user.cards?.[0]}
                            profile={user.profile}
                            user={user}
                        />

                        {/* Butonlar */}
                        <div className="flex gap-3 w-64">
                            <button
                                onClick={handleFollow}
                                className={`flex-1 py-2 rounded-full font-bold transition ${isFollowing
                                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                                    : 'bg-purple-600 text-white hover:bg-purple-700'
                                    }`}
                            >
                                {isFollowing ? 'Unfollow' : 'Follow'}
                            </button>
                            <button
                                onClick={handleMatchRequest}
                                className="flex-1 py-2 rounded-full font-bold bg-green-600 hover:bg-green-700 text-white transition"
                            >
                                ⚔️ Match
                            </button>
                        </div>
                    </div>

                    {/* Sağ — Profil Bilgileri ve Gönderiler */}
                    <div className="flex-1 space-y-4">
                        {/* Bio */}
                        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                            <h2 className="text-white text-2xl font-bold">{user.fullName}</h2>
                            <p className="text-gray-400">@{user.username}</p>
                            {user.bio && <p className="text-gray-300 mt-2">{user.bio}</p>}
                            {user.profile?.city && (
                                <p className="text-gray-400 text-sm mt-1">
                                    📍 {user.profile.city}, {user.profile.country}
                                </p>
                            )}

                            {/* Stats */}
                            <div className="flex gap-6 mt-4">
                                <div className="text-center">
                                    <p className="text-white font-bold">{user._count?.posts || 0}</p>
                                    <p className="text-gray-400 text-sm">Posts</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-white font-bold">{user._count?.followers || 0}</p>
                                    <p className="text-gray-400 text-sm">Followers</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-white font-bold">{user._count?.following || 0}</p>
                                    <p className="text-gray-400 text-sm">Following</p>
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                        {user.profile?.skills?.length > 0 && (
                            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                                <h3 className="text-white font-bold mb-4">Skills</h3>
                                <div className="space-y-3">
                                    {user.profile.skills.map(skill => (
                                        <div key={skill.id}>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-gray-300 text-sm">{skill.name}</span>
                                                <span className="text-purple-400 text-sm font-bold">{skill.value}</span>
                                            </div>
                                            <div className="w-full bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-purple-600 to-pink-500 h-2 rounded-full"
                                                    style={{ width: `${skill.value}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Posts */}
                        <div className="space-y-3">
                            <h3 className="text-white font-bold text-lg">Posts</h3>
                            {posts.length === 0 ? (
                                <p className="text-gray-400">No posts yet.</p>
                            ) : (
                                posts.map(post => (
                                    <div key={post.id} className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                                        <p className="text-white">{post.content}</p>
                                        <div className="flex gap-4 mt-3 text-gray-400 text-sm">
                                            <span>❤️ {post._count?.likes}</span>
                                            <span>💬 {post._count?.comments}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;