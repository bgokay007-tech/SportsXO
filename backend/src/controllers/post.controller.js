import prisma from '../config/prisma.js';

// Gönderi oluştur
export const createPost = async (req, res, next) => {
    try {
        const { content, imageUrl, videoUrl } = req.body;

        const post = await prisma.post.create({
            data: {
                userId: req.userId,
                content,
                imageUrl,
                videoUrl,
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
                _count: {
                    select: { likes: true, comments: true },
                },
            },
        });

        res.status(201).json(post);
    } catch (error) {
        next(error);
    }
};

// Tüm gönderileri getir (feed)
export const getFeed = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        // Takip edilenlerin gönderileri + kendi gönderileri
        const following = await prisma.follow.findMany({
            where: { followerId: req.userId },
            select: { followingId: true },
        });

        const followingIds = following.map(f => f.followingId);
        followingIds.push(req.userId);

        const posts = await prisma.post.findMany({
            where: { userId: { in: followingIds } },
            include: {
                user: {
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
                comments: {
                    take: 3,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true,
                            },
                        },
                    },
                },
                likes: {
                    where: { userId: req.userId },
                    select: { id: true },
                },
                _count: {
                    select: { likes: true, comments: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip: Number(skip),
            take: Number(limit),
        });

        const formattedPosts = posts.map(post => ({
            ...post,
            isLiked: post.likes.length > 0,
            likes: undefined,
        }));

        res.json(formattedPosts);
    } catch (error) {
        next(error);
    }
};

// Tek gönderi getir
export const getPost = async (req, res, next) => {
    try {
        const { id } = req.params;

        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        avatar: true,
                    },
                },
                comments: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true,
                            },
                        },
                    },
                },
                _count: {
                    select: { likes: true, comments: true },
                },
            },
        });

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        next(error);
    }
};

// Gönderi sil
export const deletePost = async (req, res, next) => {
    try {
        const { id } = req.params;

        const post = await prisma.post.findUnique({ where: { id } });

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.userId !== req.userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        await prisma.post.delete({ where: { id } });

        res.json({ message: 'Post deleted' });
    } catch (error) {
        next(error);
    }
};

// Beğen / Beğeniyi kaldır
export const toggleLike = async (req, res, next) => {
    try {
        const { id } = req.params;

        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId: req.userId,
                    postId: id,
                },
            },
        });

        if (existingLike) {
            await prisma.like.delete({
                where: { id: existingLike.id },
            });
            return res.json({ message: 'Like removed', isLiked: false });
        }

        await prisma.like.create({
            data: {
                userId: req.userId,
                postId: id,
            },
        });

        res.status(201).json({ message: 'Post liked', isLiked: true });
    } catch (error) {
        next(error);
    }
};

// Yorum ekle
export const addComment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        const comment = await prisma.comment.create({
            data: {
                userId: req.userId,
                postId: id,
                content,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },
            },
        });

        res.status(201).json(comment);
    } catch (error) {
        next(error);
    }
};

// Kullanıcının gönderilerini getir
export const getUserPosts = async (req, res, next) => {
    try {
        const { username } = req.params;

        const user = await prisma.user.findUnique({ where: { username } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const posts = await prisma.post.findMany({
            where: { userId: user.id },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        avatar: true,
                    },
                },
                _count: {
                    select: { likes: true, comments: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(posts);
    } catch (error) {
        next(error);
    }
};