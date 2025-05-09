import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Create a new campaign
export const createCampaign = async (req, res) => {
  try {
    const { name, color, couponIds } = req.body;

    if (!name || !color || !couponIds || !Array.isArray(couponIds) || couponIds.length === 0) {
      return res.status(400).json({ error: 'Name, color, and at least one coupon ID are required' });
    }

    // Fetch all the coupons to validate and determine start/end dates
    const coupons = await prisma.coupon.findMany({
      where: { id: { in: couponIds } }
    });

    if (coupons.length === 0) {
      return res.status(400).json({ error: 'No valid coupons found with the provided IDs' });
    }

    if (coupons.length !== couponIds.length) {
      return res.status(400).json({ error: 'Some coupon IDs are invalid' });
    }

    // Calculate start date (earliest coupon start) and end date (latest coupon end)
    const startDate = coupons.reduce(
      (earliest, coupon) => 
        coupon.issuedAt < earliest ? coupon.issuedAt : earliest,
      coupons[0].issuedAt
    );

    const endDate = coupons.reduce(
      (latest, coupon) => 
        coupon.expiresAt > latest ? coupon.expiresAt : latest,
      coupons[0].expiresAt
    );

    // Create the campaign
    const campaign = await prisma.campaign.create({
      data: {
        name,
        color,
        coupons: couponIds,
        startDate,
        endDate
      }
    });

    res.status(201).json(campaign);
  } catch (error) {
    console.error('Campaign creation error:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get all campaigns
export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany();
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single campaign by ID
export const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a campaign
export const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, couponIds } = req.body;

    // Validate that the campaign exists
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id }
    });

    if (!existingCampaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    let data = {};
    let startDate = existingCampaign.startDate;
    let endDate = existingCampaign.endDate;

    // If updating couponIds, recalculate start and end dates
    if (couponIds && Array.isArray(couponIds) && couponIds.length > 0) {
      // Fetch all the coupons to validate and determine start/end dates
      const coupons = await prisma.coupon.findMany({
        where: { id: { in: couponIds } }
      });

      if (coupons.length === 0) {
        return res.status(400).json({ error: 'No valid coupons found with the provided IDs' });
      }

      if (coupons.length !== couponIds.length) {
        return res.status(400).json({ error: 'Some coupon IDs are invalid' });
      }

      // Calculate start date (earliest coupon start) and end date (latest coupon end)
      startDate = coupons.reduce(
        (earliest, coupon) => 
          coupon.issuedAt < earliest ? coupon.issuedAt : earliest,
        coupons[0].issuedAt
      );

      endDate = coupons.reduce(
        (latest, coupon) => 
          coupon.expiresAt > latest ? coupon.expiresAt : latest,
        coupons[0].expiresAt
      );

      data.coupons = couponIds;
      data.startDate = startDate;
      data.endDate = endDate;
    }

    // Add other fields to the update object if provided
    if (name) data.name = name;
    if (color) data.color = color;

    // Update the campaign
    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data
    });

    res.json(updatedCampaign);
  } catch (error) {
    console.error('Campaign update error:', error);
    res.status(400).json({ error: error.message });
  }
};

// Delete a campaign
export const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the campaign exists
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    await prisma.campaign.delete({ where: { id } });
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get active campaigns (for public display)
export const getActiveCampaigns = async (req, res) => {
  try {
    const now = new Date();
    
    // Find campaigns where now is between startDate and endDate
    const activeCampaigns = await prisma.campaign.findMany({
      where: {
        startDate: { lte: now },
        endDate: { gte: now }
      }
    });

    // If no active campaigns, return an empty array
    if (activeCampaigns.length === 0) {
      return res.json([]);
    }

    // For each campaign, fetch the coupons for display
    const campaignsWithCoupons = await Promise.all(
      activeCampaigns.map(async (campaign) => {
        const coupons = await prisma.coupon.findMany({
          where: { 
            id: { in: campaign.coupons },
            isRunning: true,
            issuedAt: { lte: now },
            expiresAt: { gte: now }
          },
          select: {
            id: true,
            alias: true,
            percentDiscount: true,
            minPrice: true
          }
        });

        return {
          ...campaign,
          coupons: coupons
        };
      })
    );

    // Filter out campaigns with no active coupons
    const filteredCampaigns = campaignsWithCoupons.filter(
      campaign => campaign.coupons.length > 0
    );

    res.json(filteredCampaigns);
  } catch (error) {
    console.error('Error fetching active campaigns:', error);
    res.status(500).json({ error: error.message });
  }
}; 