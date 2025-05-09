import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Get coupon performance metrics
export const getCouponMetrics = async (req, res) => {
  try {
    // Get all coupons with their orders
    const coupons = await prisma.coupon.findMany({
      include: {
        orders: {
          include: {
            items: true
          }
        }
      }
    });

    // Calculate metrics for each coupon
    const couponMetrics = coupons.map(coupon => {
      const totalOrders = coupon.orders.length;
      const totalRevenue = coupon.orders.reduce((sum, order) => sum + Number(order.total), 0);
      const totalDiscountAmount = coupon.orders.reduce((sum, order) => {
        const subtotal = order.items.reduce((itemSum, item) => itemSum + (Number(item.price) * item.quantity), 0);
        const discount = (subtotal * coupon.percentDiscount) / 100;
        return sum + discount;
      }, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const uniqueUsers = Array.from(new Set(coupon.usersWhoUsedMe)).length;
      const redemptionRate = coupon.maxUsesTotal > 0 ? (uniqueUsers / coupon.maxUsesTotal) * 100 : 0;
      
      // Calculate conversion metrics
      const isActive = coupon.isRunning && 
                      new Date() >= new Date(coupon.issuedAt) && 
                      new Date() <= new Date(coupon.expiresAt);
      
      // Calculate time-based metrics
      const now = new Date();
      const startDate = new Date(coupon.issuedAt);
      const endDate = new Date(coupon.expiresAt);
      const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const daysActive = Math.ceil((Math.min(now, endDate) - startDate) / (1000 * 60 * 60 * 24));
      const daysRemaining = now <= endDate ? Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)) : 0;
      
      // Get order dates and create time series data
      const ordersByDate = {};
      coupon.orders.forEach(order => {
        const date = new Date(order.createdAt).toISOString().split('T')[0];
        if (!ordersByDate[date]) {
          ordersByDate[date] = {
            count: 0,
            revenue: 0,
            discount: 0
          };
        }
        
        const subtotal = order.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
        const discount = (subtotal * coupon.percentDiscount) / 100;
        
        ordersByDate[date].count += 1;
        ordersByDate[date].revenue += Number(order.total);
        ordersByDate[date].discount += discount;
      });
      
      // Convert to array for charting
      const timeSeriesData = Object.entries(ordersByDate).map(([date, data]) => ({
        date,
        orderCount: data.count,
        revenue: data.revenue,
        discountAmount: data.discount
      }));

      return {
        id: coupon.id,
        alias: coupon.alias,
        percentDiscount: coupon.percentDiscount,
        minPrice: coupon.minPrice,
        issuedAt: coupon.issuedAt,
        expiresAt: coupon.expiresAt,
        isActive,
        totalOrders,
        totalRevenue,
        totalDiscountAmount,
        averageOrderValue,
        uniqueUsers,
        redemptionRate,
        usageProgress: (uniqueUsers / coupon.maxUsesTotal) * 100,
        timeProgress: (daysActive / totalDays) * 100,
        daysRemaining,
        timeSeriesData
      };
    });

    res.json(couponMetrics);
  } catch (error) {
    console.error('Error fetching coupon metrics:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get campaign performance metrics
export const getCampaignMetrics = async (req, res) => {
  try {
    // Get all campaigns
    const campaigns = await prisma.campaign.findMany();
    
    // Get all coupons
    const coupons = await prisma.coupon.findMany({
      include: {
        orders: {
          include: {
            items: true
          }
        }
      }
    });
    
    // Calculate metrics for each campaign
    const campaignMetrics = await Promise.all(campaigns.map(async (campaign) => {
      // Get coupons in this campaign
      const campaignCoupons = campaign.coupons
        .map(couponId => coupons.find(c => c.id === couponId))
        .filter(Boolean);
      
      // Calculate campaign metrics
      const totalCoupons = campaignCoupons.length;
      const totalOrders = campaignCoupons.reduce((sum, coupon) => sum + coupon.orders.length, 0);
      const totalRevenue = campaignCoupons.reduce((sum, coupon) => 
        sum + coupon.orders.reduce((orderSum, order) => orderSum + Number(order.total), 0), 0);
      const totalDiscountAmount = campaignCoupons.reduce((sum, coupon) => {
        return sum + coupon.orders.reduce((orderSum, order) => {
          const subtotal = order.items.reduce((itemSum, item) => itemSum + (Number(item.price) * item.quantity), 0);
          const discount = (subtotal * coupon.percentDiscount) / 100;
          return orderSum + discount;
        }, 0);
      }, 0);
      
      // Calculate unique users across all coupons in the campaign
      const allUsers = campaignCoupons.reduce((users, coupon) => {
        return [...users, ...coupon.usersWhoUsedMe];
      }, []);
      const uniqueUsers = Array.from(new Set(allUsers)).length;
      
      // Calculate campaign start and end dates based on coupons
      const isActive = new Date() >= new Date(campaign.startDate) && new Date() <= new Date(campaign.endDate);
      
      // Get time series data for the campaign
      const startDate = new Date(campaign.startDate);
      const endDate = new Date(campaign.endDate);
      const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const now = new Date();
      const daysActive = Math.ceil((Math.min(now, endDate) - startDate) / (1000 * 60 * 60 * 24));
      const daysRemaining = now <= endDate ? Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)) : 0;
      
      // Aggregate orders by date for the campaign
      const ordersByDate = {};
      campaignCoupons.forEach(coupon => {
        coupon.orders.forEach(order => {
          const date = new Date(order.createdAt).toISOString().split('T')[0];
          if (!ordersByDate[date]) {
            ordersByDate[date] = {
              count: 0,
              revenue: 0,
              discount: 0
            };
          }
          
          const subtotal = order.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
          const discount = (subtotal * coupon.percentDiscount) / 100;
          
          ordersByDate[date].count += 1;
          ordersByDate[date].revenue += Number(order.total);
          ordersByDate[date].discount += discount;
        });
      });
      
      // Convert to array for charting
      const timeSeriesData = Object.entries(ordersByDate).map(([date, data]) => ({
        date,
        orderCount: data.count,
        revenue: data.revenue,
        discountAmount: data.discount
      }));
      
      return {
        id: campaign.id,
        name: campaign.name,
        color: campaign.color,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        isActive,
        totalCoupons,
        totalOrders,
        totalRevenue,
        totalDiscountAmount,
        uniqueUsers,
        timeProgress: (daysActive / totalDays) * 100,
        daysRemaining,
        couponData: campaignCoupons.map(coupon => ({
          id: coupon.id,
          alias: coupon.alias,
          percentDiscount: coupon.percentDiscount,
          orders: coupon.orders.length,
          revenue: coupon.orders.reduce((sum, order) => sum + Number(order.total), 0)
        })),
        timeSeriesData
      };
    }));

    res.json(campaignMetrics);
  } catch (error) {
    console.error('Error fetching campaign metrics:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get overview metrics
export const getOverviewMetrics = async (req, res) => {
  try {
    // Get counts
    const totalCoupons = await prisma.coupon.count();
    const activeCoupons = await prisma.coupon.count({
      where: {
        isRunning: true,
        issuedAt: { lte: new Date() },
        expiresAt: { gte: new Date() }
      }
    });
    
    const totalCampaigns = await prisma.campaign.count();
    const activeCampaigns = await prisma.campaign.count({
      where: {
        startDate: { lte: new Date() },
        endDate: { gte: new Date() }
      }
    });
    
    // Get all orders with coupons
    const ordersWithCoupons = await prisma.order.findMany({
      where: {
        couponId: { not: null }
      },
      include: {
        items: true,
        coupon: true
      }
    });
    
    // Calculate revenue metrics
    const totalDiscountedRevenue = ordersWithCoupons.reduce((sum, order) => sum + Number(order.total), 0);
    const totalDiscountAmount = ordersWithCoupons.reduce((sum, order) => {
      const subtotal = order.items.reduce((itemSum, item) => itemSum + (Number(item.price) * item.quantity), 0);
      const discount = order.coupon ? (subtotal * order.coupon.percentDiscount) / 100 : 0;
      return sum + discount;
    }, 0);
    
    // Calculate daily metrics for the past 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const recentOrders = ordersWithCoupons.filter(order => 
      new Date(order.createdAt) >= thirtyDaysAgo
    );
    
    // Group by date
    const dailyMetrics = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      dailyMetrics[dateString] = {
        revenue: 0,
        discount: 0,
        orders: 0
      };
    }
    
    recentOrders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (dailyMetrics[date]) {
        const subtotal = order.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
        const discount = order.coupon ? (subtotal * order.coupon.percentDiscount) / 100 : 0;
        
        dailyMetrics[date].revenue += Number(order.total);
        dailyMetrics[date].discount += discount;
        dailyMetrics[date].orders += 1;
      }
    });
    
    // Convert to array and sort by date
    const timeSeriesData = Object.entries(dailyMetrics)
      .map(([date, metrics]) => ({
        date,
        revenue: metrics.revenue,
        discount: metrics.discount,
        orders: metrics.orders
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    res.json({
      coupons: {
        total: totalCoupons,
        active: activeCoupons
      },
      campaigns: {
        total: totalCampaigns,
        active: activeCampaigns
      },
      revenue: {
        totalDiscountedRevenue,
        totalDiscountAmount,
        averageDiscount: ordersWithCoupons.length > 0 ? totalDiscountAmount / ordersWithCoupons.length : 0
      },
      timeSeriesData
    });
  } catch (error) {
    console.error('Error fetching overview metrics:', error);
    res.status(500).json({ error: error.message });
  }
}; 