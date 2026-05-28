import prisma from '../config/prisma.js';

// Kullanıcı profili getir
export const getUserProfile = async (req, res, next) => {
    try {
        const { username } = req.params;

        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                email: true,
                username: true,
                fullName: true,
                avatar: true,
                bio: true,
                createdAt: true,
                profile: {
                    include: { skills: true },
                },
                cards: true,
                _count: {
                    select: {
                        posts: true,
                        followers: true,
                        following: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
};

// Profil güncelle
export const updateProfile = async (req, res, next) => {
    try {
        const { fullName, bio, avatar, sport, position, level, city, country } = req.body;

        const user = await prisma.user.update({
            where: { id: req.userId },
            data: {
                fullName,
                bio,
                avatar,
                profile: {
                    update: {
                        sport,
                        position,
                        level,
                        city,
                        country,
                    },
                },
            },
            select: {
                id: true,
                email: true,
                username: true,
                fullName: true,
                avatar: true,
                bio: true,
                profile: true,
            },
        });

        res.json(user);
    } catch (error) {
        next(error);
    }
};

// Yetenek ekle/güncelle
export const updateSkills = async (req, res, next) => {
    try {
        const { skills } = req.body;

        const profile = await prisma.athleteProfile.findUnique({
            where: { userId: req.userId },
        });

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Mevcut yetenekleri sil ve yenilerini ekle
        await prisma.skill.deleteMany({ where: { profileId: profile.id } });

        const newSkills = await prisma.skill.createMany({
            data: skills.map(skill => ({
                profileId: profile.id,
                name: skill.name,
                value: skill.value,
            })),
        });

        res.json({ message: 'Skills updated', count: newSkills.count });
    } catch (error) {
        next(error);
    }
};

// Kullanıcı ara
export const searchUsers = async (req, res, next) => {
    try {
        const { q, sport } = req.query;

        const users = await prisma.user.findMany({
            where: {
                AND: [
                    q ? {
                        OR: [
                            { username: { contains: q, mode: 'insensitive' } },
                            { fullName: { contains: q, mode: 'insensitive' } },
                        ],
                    } : {},
                    sport ? { profile: { sport } } : {},
                ],
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
                    },
                },
                cards: {
                    select: {
                        cardLevel: true,
                    },
                },
            },
            take: 20,
        });

        res.json(users);
    } catch (error) {
        next(error);
    }
};

// Takip et
export const followUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        if (userId === req.userId) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }

        const follow = await prisma.follow.create({
            data: {
                followerId: req.userId,
                followingId: userId,
            },
        });

        res.status(201).json({ message: 'Followed successfully', follow });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'Already following' });
        }
        next(error);
    }
};

// Takibi bırak
export const unfollowUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: req.userId,
                    followingId: userId,
                },
            },
        });

        res.json({ message: 'Unfollowed successfully' });
    } catch (error) {
        next(error);
    }
};