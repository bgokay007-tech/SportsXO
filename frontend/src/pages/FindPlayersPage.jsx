import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function PlayerCard({ player, onMatchRequest }) {
    const cardLevelColors = {
        BRONZE: 'from-amber-700 to-amber-500',
        SILVER: 'from-gray-400 to-gray-300',
        GOLD: 'from-yellow-500 to-yellow-300',
        PLATINUM: 'from-cyan-400 to-blue-400',
        LEGEND: 'from-purple-600 to-pink-500',
    };

    const level = player.cards?.[0]?.cardLevel || 'BRONZE';
    const gradient = cardLevelColors[level];

    return (
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 hover:border-purple-500/50 transition">
            <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-b ${gradient} flex items-center justify-center text-2xl font-bold text-white shadow-lg`}>
                    {player.username?.[0]?.toUpperCase()}
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg">{player.fullName}</h3>
                    <p className="text-gray-400 text-sm">@{player.username}</p>
                    <span className={`text-xs font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                        {level}
                    </span>
                </div>
            </div>

            {/* Sport & Level */}
            <div className="flex gap-2 mb-4">
                <span className="bg-purple-500/20 text-purple-400 text-xs font-bold px-3 py-1 rounded-full border border-purple-500/30">
                    {player.profile?.sport || 'general'}
                </span>
                <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/30">
                    {player.profile?.level || 'BEGINNER'}
                </span>
            </div>

            {/* Stats */}
            {player.cards?.[0] && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                    {[
                        { label: 'PWR', value: player.cards[0].power },
                        { label: 'SPD', value: player.cards[0].speed },
                        { label: 'TEC', value: player.cards[0].technique },
                        { label: 'STA', value: player.cards[0].stamina },
                    ].map(stat => (
                        <div key={stat.label} className="bg-gray-800 rounded-lg p-2 text-center">
                            <p className="text-gray-400 text-xs">{stat.label}</p>
                            <p className="text-white font-bold text-sm">{stat.value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Location & Points */}
            <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                {player.profile?.city && (
                    <span>📍 {player.profile.city}</span>
                )}
                <span>⭐ {player.profile?.totalPoints || 0} pts</span>
            </div>

            {/* W/L */}
            <div className="flex gap-4 text-sm mb-4">
                <span className="text-green-400">✓ {player.profile?.wins || 0} W</span>
                <span className="text-red-400">✗ {player.profile?.losses || 0} L</span>
                <span className="text-yellow-400">= {player.profile?.draws || 0} D</span>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={() => onMatchRequest(player)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-xl transition text-sm"
                >
                    ⚔️ Challenge
                </button>
            </div>
        </div>
    );
}

function FindPlayersPage() {
    const navigate = useNavigate();
    const [players, setPlayers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [filters, setFilters] = useState({
        sport: '',
        level: '',
        city: '',
    });

    const handleSearch = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.sport) params.append('sport', filters.sport);
            if (filters.level) params.append('level', filters.level);
            if (filters.city) params.append('city', filters.city);

            const { data } = await api.get(`/matches/find-players?${params}`);
            setPlayers(data);
            setSearched(true);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMatchRequest = async (player) => {
        try {
            await api.post('/matches', {
                receiverId: player.id,
                sport: player.profile?.sport || filters.sport,
                message: `Hey ${player.username}! Let's play a match! 🏆`,
            });
            alert(`Match request sent to ${player.username}! 🎯`);
        } catch (err) {
            alert(err.response?.data?.message || 'Error sending request');
        }
    };

    return (
        <div className="min-h-screen bg-gray-950">
            <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <button onClick={() => navigate('/feed')} className="text-gray-400 hover:text-white">
                        ← Back
                    </button>
                    <h1 className="text-2xl font-bold text-white">
                        Sports<span className="text-purple-500">XO</span>
                    </h1>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                <h2 className="text-3xl font-bold text-white">🔍 Find Players</h2>
                <p className="text-gray-400">Find athletes to challenge or team up with!</p>

                {/* Search Filters */}
                <form onSubmit={handleSearch} className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select
                            value={filters.sport}
                            onChange={(e) => setFilters({ ...filters, sport: e.target.value })}
                            className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-purple-500"
                        >
                            <option value="">All Sports</option>
                            <option value="football">⚽ Football</option>
                            <option value="basketball">🏀 Basketball</option>
                            <option value="tennis">🎾 Tennis</option>
                            <option value="volleyball">🏐 Volleyball</option>
                            <option value="general">🏆 General</option>
                        </select>

                        <select
                            value={filters.level}
                            onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                            className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-purple-500"
                        >
                            <option value="">All Levels</option>
                            <option value="BEGINNER">Beginner</option>
                            <option value="AMATEUR">Amateur</option>
                            <option value="SEMI_PRO">Semi Pro</option>
                            <option value="PRO">Pro</option>
                        </select>

                        <input
                            type="text"
                            placeholder="City (optional)"
                            value={filters.city}
                            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                            className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
                    >
                        {isLoading ? 'Searching...' : '🔍 Find Players'}
                    </button>
                </form>

                {/* Results */}
                {searched && (
                    <div>
                        <h3 className="text-white font-bold text-xl mb-4">
                            {players.length} player{players.length !== 1 ? 's' : ''} found
                        </h3>
                        {players.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-400 text-lg">No players found. Try different filters!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {players.map(player => (
                                    <PlayerCard
                                        key={player.id}
                                        player={player}
                                        onMatchRequest={handleMatchRequest}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default FindPlayersPage;