import prisma from '../config/prisma.js';

// Turnuva oluştur
export const createTournament = async (req, res, next) => {
    try {
        const { name, sport, description, maxPlayers, startDate, endDate } = req.body;

        const tournament = await prisma.tournament.create({
            data: {
                name,
                sport,
                description,
                maxPlayers: Number(maxPlayers),
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
            },
        });

        res.status(201).json(tournament);
    } catch (error) {
        next(error);
    }
};

// Tüm turnuvaları getir
export const getTournaments = async (req, res, next) => {
    try {
        const { sport, status } = req.query;

        const tournaments = await prisma.tournament.findMany({
            where: {
                AND: [
                    sport ? { sport } : {},
                    status ? { status } : {},
                ],
            },
            include: {
                _count: {
                    select: { participants: true },
                },
            },
            orderBy: { startDate: 'asc' },
        });

        res.json(tournaments);
    } catch (error) {
        next(error);
    }
};

// Tek turnuva getir
export const getTournament = async (req, res, next) => {
    try {
        const { id } = req.params;

        const tournament = await prisma.tournament.findUnique({
            where: { id },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                fullName: true,
                                avatar: true,
                                profile: {
                                    select: {
                                        sport: true,
                                        level: true,
                                        totalPoints: true,
                                    },
                                },
                                cards: {
                                    select: {
                                        cardLevel: true,
                                        power: true,
                                        speed: true,
                                        technique: true,
                                        stamina: true,
                                    },
                                },
                            },
                        },
                    },
                },
                _count: {
                    select: { participants: true },
                },
            },
        });

        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        res.json(tournament);
    } catch (error) {
        next(error);
    }
};

// Turnuvaya katıl
export const joinTournament = async (req, res, next) => {
    try {
        const { id } = req.params;

        const tournament = await prisma.tournament.findUnique({
            where: { id },
            include: {
                _count: { select: { participants: true } },
            },
        });

        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        if (tournament.status !== 'UPCOMING') {
            return res.status(400).json({ message: 'Tournament is not open for registration' });
        }

        if (tournament._count.participants >= tournament.maxPlayers) {
            return res.status(400).json({ message: 'Tournament is full' });
        }

        const participant = await prisma.tournamentParticipant.create({
            data: {
                tournamentId: id,
                userId: req.userId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        avatar: true,
                    },
                },
            },
        });

        res.status(201).json({ message: 'Joined tournament', participant });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'Already joined this tournament' });
        }
        next(error);
    }
};

// Turnuvadan ayrıl
export const leaveTournament = async (req, res, next) => {
    try {
        const { id } = req.params;

        await prisma.tournamentParticipant.delete({
            where: {
                tournamentId_userId: {
                    tournamentId: id,
                    userId: req.userId,
                },
            },
        });

        res.json({ message: 'Left tournament successfully' });
    } catch (error) {
        next(error);
    }
};

// Turnuva durumunu güncelle
export const updateTournamentStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const tournament = await prisma.tournament.update({
            where: { id },
            data: { status },
        });

        res.json(tournament);
    } catch (error) {
        next(error);
    }
};