import express from "express";
import pool from "../db.js";
import { optionalAuth } from "../middleware/authRoles.js";

const router = express.Router();

router.get("/listings/stats", optionalAuth, async (req, res, next) => {
  try {
    const [totalListings] = await pool.query("SELECT COUNT(*) as count FROM listings");
    const [byStatus] = await pool.query(
      "SELECT status, COUNT(*) as count FROM listings GROUP BY status"
    );
    const [byMake] = await pool.query(
      "SELECT make, COUNT(*) as count FROM listings GROUP BY make ORDER BY count DESC LIMIT 10"
    );
    const [avgPrice] = await pool.query(
      "SELECT AVG(price) as avg_price, MIN(price) as min_price, MAX(price) as max_price FROM listings"
    );
    const [byYear] = await pool.query(
      "SELECT year, COUNT(*) as count FROM listings GROUP BY year ORDER BY year DESC LIMIT 10"
    );

    const jsonResponse = {
      success: true,
      generatedAt: new Date().toISOString(),
      statistics: {
        total: totalListings[0]?.count || 0,
        byStatus: byStatus.reduce((acc, row) => {
          acc[row.status] = row.count;
          return acc;
        }, {}),
        topMakes: byMake,
        priceRange: {
          average: parseFloat(avgPrice[0]?.avg_price || 0).toFixed(2),
          minimum: parseFloat(avgPrice[0]?.min_price || 0).toFixed(2),
          maximum: parseFloat(avgPrice[0]?.max_price || 0).toFixed(2),
        },
        byYear: byYear,
      },
      metadata: {
        source: "Car Marketplace Database",
        format: "JSON",
        version: "1.0",
      },
    };

    res.json(jsonResponse);
  } catch (err) {
    next(err);
  }
});

router.get("/users/activity", optionalAuth, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const [recentListings] = await pool.query(
      `SELECT 
         l.listing_id,
         l.make,
         l.model,
         l.year,
         l.price,
         l.created_at,
         u.username AS seller_name
       FROM listings l
       JOIN users u ON l.seller_id = u.user_id
       ORDER BY l.created_at DESC
       LIMIT ?`,
      [limit]
    );

    const [topSellers] = await pool.query(
      `SELECT 
         u.user_id,
         u.username,
         u.email,
         COUNT(l.listing_id) AS listing_count,
         AVG(l.price) AS avg_listing_price
       FROM users u
       LEFT JOIN listings l ON u.user_id = l.seller_id
       GROUP BY u.user_id, u.username, u.email
       HAVING listing_count > 0
       ORDER BY listing_count DESC
       LIMIT 10`
    );

    const [messageActivity] = await pool.query(
      `SELECT 
         DATE(sent_at) AS date,
         COUNT(*) AS message_count
       FROM messages
       WHERE sent_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(sent_at)
       ORDER BY date DESC
       LIMIT 30`
    );

    const jsonResponse = {
      success: true,
      generatedAt: new Date().toISOString(),
      data: {
        recentListings: recentListings,
        topSellers: topSellers,
        messageActivity: messageActivity,
      },
      summary: {
        recentListingsCount: recentListings.length,
        topSellersCount: topSellers.length,
        messageActivityDays: messageActivity.length,
      },
    };

    res.json(jsonResponse);
  } catch (err) {
    next(err);
  }
});

router.get("/marketplace/summary", optionalAuth, async (req, res, next) => {
  try {
    const [listingsStats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available,
        COUNT(CASE WHEN status = 'sold' THEN 1 END) as sold,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
      FROM listings
    `);

    const [priceStats] = await pool.query(`
      SELECT 
        AVG(price) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price,
        STDDEV(price) as price_stddev
      FROM listings
      WHERE status = 'available'
    `);

    const [popularBodyTypes] = await pool.query(`
      SELECT 
        body_type,
        COUNT(*) as count,
        AVG(price) as avg_price
      FROM listings
      WHERE status = 'available'
      GROUP BY body_type
      ORDER BY count DESC
      LIMIT 5
    `);

    const jsonResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      marketplace: {
        listings: listingsStats[0],
        pricing: {
          average: parseFloat(priceStats[0]?.avg_price || 0).toFixed(2),
          minimum: parseFloat(priceStats[0]?.min_price || 0).toFixed(2),
          maximum: parseFloat(priceStats[0]?.max_price || 0).toFixed(2),
          standardDeviation: parseFloat(priceStats[0]?.price_stddev || 0).toFixed(2),
        },
        popularBodyTypes: popularBodyTypes,
      },
      format: "JSON",
      version: "1.0",
    };

    res.json(jsonResponse);
  } catch (err) {
    next(err);
  }
});

export default router;
