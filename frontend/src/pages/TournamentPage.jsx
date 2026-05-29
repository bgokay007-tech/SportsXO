import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function TournamentCard({ tournament, onJoin }) {
    const statusColors = {
        UPCOMING: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        ONGOING: 'bg-green-500/20 text-green-400 border-green-500/30',
        FINISHED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };

    const sportEmojis = {
        football: '⚽',
        basketball: '🏀',
        tennis: '🎾',
        volleyball: '🏐',
        general: '🏆',
    };

    return (
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 hover:border-purple-500/50 transition">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <span className="text-2xl">{sportEmojis[tournament.sport] || '🏆'}</span>
                    <h3 className="text-white font-bold text-lg mt-1">{tournament.name}</h3>
                    <p className="text-gray-400 text-sm">{tournament.sport}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusColors[tournament.status]}`}>
                    {tournament.status}
                </span>
            </div>

            {tournament.description && (
                <p className="text-gray-300 text-sm mb-3">{tournament.description}</p>
            )}

            <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                <span>👥 {tournament._count?.participants}/{tournament.maxPlayers} players</span>
                <span>📅 {new Date(tournament.startDate).toLocaleDateString()}</span>
            </div>

            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                <div
                    className="bg-gradient-to-r from-purple-600 to-pink-500 h-2 rounded-full transition-all"
                    style={{ width: `${(tournament._count?.participants / tournament.maxPlayers) * 100}%` }}
                />
            </div>

            {tournament.status === 'UPCOMING' && (
                <button
                    onClick={() => onJoin(tournament.id)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-xl transition"
                >
                    Join Tournament
                </button>
            )}
        </div>
    );
}

function TournamentPage() {
    const navigate = useNavigate();
    const [tournaments, setTournaments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [filter, setFilter] = useState('ALL');
    const [formData, setFormData] = useState({
        name: '',
        sport: 'football',
        description: '',
        maxPlayers: 16,
        startDate: '',
    });

    useEffect(() => {
        let ignore = false;

        api.get('/tournaments').then(({ data }) => {
            if (!ignore) {
                setTournaments(data);
                setIsLoading(false);
            }
        }).catch((err) => {
            console.error(err);
            if (!ignore) setIsLoading(false);
        });

        return () => { ignore = true; };
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/tournaments', formData);
            setTournaments(prev => [data, ...prev]);
            setShowCreate(false);
            setFormData({ name: '', sport: 'football', description: '', maxPlayers: 16, startDate: '' });
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating tournament');
        }
    };

    const handleJoin = async (tournamentId) => {
        try {
            await api.post(`/tournaments/${tournamentId}/join`);
            alert('Joined tournament! 🎉');
            const { data } = await api.get('/tournaments');
            setTournaments(data);
        } catch (err) {
            alert(err.response?.data?.message || 'Error joining tournament');
        }
    };

    const filtered = filter === 'ALL'
        ? tournaments
        : tournaments.filter(t => t.status === filter);

    return (
        <div className="min-h-screen bg-gray-950">
            <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/feed')} className="text-gray-400 hover:text-white">
                            ← Back
                        </button>
                        <h1 className="text-2xl font-bold text-white">
                            Sports<span className="text-purple-500">XO</span>
                        </h1>
                    </div>
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-full transition text-sm"
                    >
                        + Create
                    </button>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                <h2 className="text-3xl font-bold text-white">🏆 Tournaments</h2>

                {showCreate && (
                    <div className="bg-gray-900 rounded-2xl p-6 border border-purple-500/50">
                        <h3 className="text-white font-bold text-xl mb-4">Create Tournament</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Tournament name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-purple-500"
                                required
                            />
                            <select
                                value={formData.sport}
                                onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-purple-500"
                            >
                                <option value="football">⚽ Football</option>
                                <option value="basketball">🏀 Basketball</option>
                                <option value="tennis">🎾 Tennis</option>
                                <option value="volleyball">🏐 Volleyball</option>
                                <option value="general">🏆 General</option>
                            </select>
                            <textarea
                                placeholder="Description (optional)"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-purple-500 resize-none"
                                rows={2}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="number"
                                    placeholder="Max players"
                                    value={formData.maxPlayers}
                                    onChange={(e) => setFormData({ ...formData, maxPlayers: e.target.value })}
                                    className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-purple-500"
                                    min={2}
                                    max={64}
                                />
                                <input
                                    type="datetime-local"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-purple-500"
                                    required
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition"
                                >
                                    Create Tournament
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreate(false)}
                                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="flex gap-2">
                    {['ALL', 'UPCOMING', 'ONGOING', 'FINISHED'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition ${filter === f
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <p className="text-gray-400 text-center py-8">Loading tournaments...</p>
                ) : filtered.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No tournaments found. Create one! 🏆</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filtered.map(tournament => (
                            <TournamentCard
                                key={tournament.id}
                                tournament={tournament}
                                onJoin={handleJoin}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default TournamentPage;