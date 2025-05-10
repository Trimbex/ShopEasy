import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Get admin dashboard statistics with optional time period filter
 * Time periods: 24h, week, month, all
 */
export const getDashboardStats = async (req, res) => {
  try {
    const { period } = req.query;
    let dateFilter = {};
    const now = new Date();
    
    // Apply date filter based on period
    if (period === '24h') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      dateFilter = { createdAt: { gte: yesterday } };
    } else if (period === 'week') {
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 7);
      dateFilter = { createdAt: { gte: lastWeek } };
    } else if (period === 'month') {
      const lastMonth = new Date(now);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      dateFilter = { createdAt: { gte: lastMonth } };
    }
    
    // Get total counts
    const [totalUsers, totalOrders, totalProducts] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.product.count(),
    ]);
    
    // Get recent orders based on period
    const recentOrders = await prisma.order.count({
      where: dateFilter
    });
    
    // Get recent orders data with more detail
    const recentOrdersData = await prisma.order.findMany({
      where: dateFilter,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });
    
    // Calculate revenue and other metrics
    const totalRevenue = await prisma.order.aggregate({
      _sum: {
        total: true
      },
      where: dateFilter
    });
    
    // Format order data
    const formattedRecentOrders = recentOrdersData.map(order => ({
      id: order.id,
      customer: order.user?.name || 'Guest',
      email: order.user?.email || 'N/A',
      total: Number(order.total),
      status: order.status,
      items: order.items.map(item => ({
        product: item.product.name,
        quantity: item.quantity,
        price: Number(item.price)
      })),
      createdAt: order.createdAt
    }));
    
    res.json({
      message: 'Admin dashboard data',
      stats: {
        totalUsers,
        totalOrders,
        totalProducts,
        recentOrders,
        revenue: Number(totalRevenue._sum.total || 0),
        recentOrdersData: formattedRecentOrders
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin dashboard statistics' });
  }
}; 