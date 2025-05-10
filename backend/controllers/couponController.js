import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Create a new coupon
export const createCoupon = async (req, res) => {
  try {
    const {
      alias,
      issuedAt,
      expiresAt,
      minPrice,
      percentDiscount,
      maxUsesPerUser,
      maxUsesTotal,
      isRunning
    } = req.body;

    const coupon = await prisma.coupon.create({
      data: {
        alias,
        issuedAt: new Date(issuedAt),
        expiresAt: new Date(expiresAt),
        minPrice,
        percentDiscount,
        maxUsesPerUser,
        maxUsesTotal,
        isRunning,
        usersWhoUsedMe: [],
      },
    });
    res.status(201).json(coupon);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all coupons
export const getCoupons = async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single coupon by ID
export const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a coupon
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const coupon = await prisma.coupon.update({ where: { id }, data });
    res.json(coupon);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a coupon
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.coupon.delete({ where: { id } });
    res.json({ message: 'Coupon deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Apply a coupon (validate and return discount info)
export const applyCoupon = async (req, res) => {
  try {
    const { alias, orderTotal } = req.body;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const coupon = await prisma.coupon.findUnique({ where: { alias } });
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });

    // Check if running
    if (!coupon.isRunning) return res.status(400).json({ error: 'Coupon is not active' });

    // Check expiry
    const now = new Date();
    if (now < coupon.issuedAt) return res.status(400).json({ error: 'Coupon not yet valid' });
    if (now > coupon.expiresAt) return res.status(400).json({ error: 'Coupon expired' });

    // Check min price
    if (Number(orderTotal) < Number(coupon.minPrice)) {
      return res.status(400).json({ error: `Order total must be at least $${coupon.minPrice}` });
    }

    // Check max uses per user
    const userUses = coupon.usersWhoUsedMe.filter(uid => uid === userId).length;
    if (userUses >= coupon.maxUsesPerUser) {
      return res.status(400).json({ error: 'Coupon usage limit reached for this user' });
    }

    // Check max uses total (unique users)
    const uniqueUsers = Array.from(new Set(coupon.usersWhoUsedMe));
    if (uniqueUsers.length >= coupon.maxUsesTotal && !uniqueUsers.includes(userId)) {
      return res.status(400).json({ error: 'Coupon usage limit reached' });
    }

    // All checks passed, add user to usersWhoUsedMe
    await prisma.coupon.update({
      where: { id: coupon.id },
      data: {
        usersWhoUsedMe: {
          push: userId,
        },
      },
    });

    // Calculate discount
    const discount = (Number(orderTotal) * coupon.percentDiscount) / 100;
    res.json({
      message: 'Coupon applied',
      discount,
      percentDiscount: coupon.percentDiscount,
      couponId: coupon.id,
      alias: coupon.alias,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}; 