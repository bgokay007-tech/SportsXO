import prisma from '../config/prisma.js';

// Maç isteği gönder
export const sendMatchRequest = async (req, res, next) => {
    try {
        const { receiverId, sport, message } = req.body;

        if (receiverId === req.userId) {
            return res.status(400).json({ message: 'You cannot send a match request to yourself' });
        }

        const receiver = await prisma.user.findUnique({ where: { id: receiverId } });

        if (!receiver) {
            return res.status(404).json({ message: 'User not found' });
        }

        const existingRequest = await prisma.matchRequest.findFirst({
            where: {
                senderId: req.userId,
                receiverId,
                status: 'PENDING',
            },
        });

        if (existingRequest) {
            return res.status(409).json({ message: 'Match request already sent' });
        }

        const matchRequest = await prisma.matchRequest.create({
            data: {
                senderId: req.userId,
                receiverId,
                sport,
                message,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        avatar: true,
                        profile: {
                            select: { sport: true, level: true },
                        },
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        avatar: true,
                        profile: {
                            select: { sport: true, level: true },
                        },
                    },
                },
            },
        });

        res.status(201).json(matchRequest);
    } catch (error) {
        next(error);
    }
};

// Gelen istekleri getir
export const getIncomingRequests = async (req, res, next) => {
    try {
        const requests = await prisma.matchRequest.findMany({
            where: { receiverId: req.userId },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        avatar: true,
                        profile: {
                            select: { sport: true, level: true, totalPoints: true },
                        },
                        cards: {
                            select: { cardLevel: true, power: true, speed: true, technique: true, stamina: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(requests);
    } catch (error) {
        next(error);
    }
};

// Gönderilen istekleri getir
export const getOutgoingRequests = async (req, res, next) => {
    try {
        const requests = await prisma.matchRequest.findMany({
            where: { senderId: req.userId },
            include: {
                receiver: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        avatar: true,
                        profile: {
                            select: { sport: true, level: true, totalPoints: true },
                        },
                        cards: {
                            select: { cardLevel: true, power: true, speed: true, technique: true, stamina: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(requests);
    } catch (error) {
        next(error);
    }
};

// İsteği kabul et / reddet
export const respondToRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // ACCEPTED or REJECTED

        const request = await prisma.matchRequest.findUnique({ where: { id } });

        if (!request) {
            return res.status(404).json({ message: 'Match request not found' });
        }

        if (request.receiverId !== req.userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        if (request.status !== 'PENDING') {
            return res.status(400).json({ message: 'Request already responded' });
        }

        const updatedRequest = await prisma.matchRequest.update({
            where: { id },
            data: { status },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        avatar: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        avatar: true,
                    },
                },
            },
        });

        res.json(updatedRequest);
    } catch (error) {
        next(error);
    }
};

// İsteği sil
export const deleteRequest = async (req, res, next) => {
    try {
        const { id } = req.params;

        const request = await prisma.matchRequest.findUnique({ where: { id } });

        if (!request) {
            return res.status(404).json({ message: 'Match request not found' });
        }

        if (request.senderId !== req.userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        await prisma.matchRequest.delete({ where: { id } });

        res.json({ message: 'Match request deleted' });
    } catch (error) {
        next(error);
    }
};

// Spor dalına göre oyuncu ara
export const findPlayers = async (req, res, next) => {
    try {
        const { sport, level, city } = req.query;

        const players = await prisma.user.findMany({
            where: {
                id: { not: req.userId },
                profile: {
                    AND: [
                        sport ? { sport } : {},
                        level ? { level } : {},
                        city ? { city } : {},
                    ],
                },
            },
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
                        city: true,
                        country: true,
                        wins: true,
                        losses: true,
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
            take: 20,
        });

        res.json(players);
    } catch (error) {
        next(error);
    }
};