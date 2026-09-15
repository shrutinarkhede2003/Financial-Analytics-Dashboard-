import { Request, Response } from 'express';
import { Transaction } from '../models/Transaction';
import { Parser } from 'json2csv';

// Helper to build MongoDB query filter from request parameters
const buildFilterQuery = (query: any) => {
  const filter: any = {};

  // Category filter
  if (query.category && query.category !== 'All') {
    filter.category = query.category;
  }

  // Status filter
  if (query.status && query.status !== 'All') {
    filter.status = query.status;
  }

  // User ID filter
  if (query.user_id && query.user_id !== 'All') {
    filter.user_id = query.user_id;
  }

  // Date range filter
  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) {
      filter.date.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      const end = new Date(query.endDate);
      // Set to end of day if only date is provided
      end.setHours(23, 59, 59, 999);
      filter.date.$lte = end;
    }
  }

  // Amount range filter
  if (query.minAmount !== undefined && query.minAmount !== '') {
    filter.amount = filter.amount || {};
    filter.amount.$gte = parseFloat(query.minAmount);
  }
  if (query.maxAmount !== undefined && query.maxAmount !== '') {
    filter.amount = filter.amount || {};
    filter.amount.$lte = parseFloat(query.maxAmount);
  }

  // General Search across fields
  if (query.search && query.search.trim()) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    const searchNum = parseFloat(query.search.trim());

    const orConditions: any[] = [
      { user_id: searchRegex },
      { category: searchRegex },
      { status: searchRegex },
    ];

    if (!isNaN(searchNum)) {
      orConditions.push({ id: searchNum });
      orConditions.push({ amount: searchNum });
    }

    if (filter.$and) {
      filter.$and.push({ $or: orConditions });
    } else {
      filter.$or = orConditions;
    }
  }

  return filter;
};

// GET /api/transactions
export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const sortBy = (req.query.sortBy as string) || 'date';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const filter = buildFilterQuery(req.query);

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transactions',
      error: error.message,
    });
  }
};

// GET /api/transactions/stats
export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter = buildFilterQuery(req.query);

    // 1. Overall Totals
    const totalsAggregation = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ['$category', 'Revenue'] }, '$amount', 0],
            },
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ['$category', 'Expense'] }, '$amount', 0],
            },
          },
          paidCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Paid'] }, 1, 0],
            },
          },
          pendingCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0],
            },
          },
          paidAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Paid'] }, '$amount', 0],
            },
          },
          pendingAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Pending'] }, '$amount', 0],
            },
          },
        },
      },
    ]);

    const summary = totalsAggregation[0] || {
      totalCount: 0,
      totalRevenue: 0,
      totalExpense: 0,
      paidCount: 0,
      pendingCount: 0,
      paidAmount: 0,
      pendingAmount: 0,
    };

    summary.netBalance = summary.totalRevenue - summary.totalExpense;

    // 2. Monthly Trends (Revenue vs Expense)
    const monthlyTrends = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          revenue: {
            $sum: {
              $cond: [{ $eq: ['$category', 'Revenue'] }, '$amount', 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ['$category', 'Expense'] }, '$amount', 0],
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
    ]);

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const formattedMonthlyTrends = monthlyTrends.map((item) => {
      const monthIndex = item._id.month - 1;
      return {
        month: `${monthNames[monthIndex]} ${item._id.year}`,
        monthNumber: item._id.month,
        revenue: Math.round(item.revenue * 100) / 100,
        expense: Math.round(item.expense * 100) / 100,
        net: Math.round((item.revenue - item.expense) * 100) / 100,
        count: item.count,
      };
    });

    // 3. Category Breakdown
    const categoryBreakdown = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // 4. User Breakdown
    const userBreakdown = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$user_id',
          revenue: {
            $sum: {
              $cond: [{ $eq: ['$category', 'Revenue'] }, '$amount', 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ['$category', 'Expense'] }, '$amount', 0],
            },
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      summary,
      monthlyTrends: formattedMonthlyTrends,
      categoryBreakdown,
      userBreakdown,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to calculate analytics statistics',
      error: error.message,
    });
  }
};

// POST /api/transactions/export-csv
export const exportCsv = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      columns = ['id', 'date', 'amount', 'category', 'status', 'user_id'],
      columnAliases = {},
      dateFormat = 'iso', // 'iso' | 'locale'
      formatCurrency = false,
      filters = {},
      scope = 'filtered', // 'filtered' | 'all'
    } = req.body;

    const queryFilter = scope === 'all' ? {} : buildFilterQuery(filters);

    const transactions = await Transaction.find(queryFilter)
      .sort({ date: -1 })
      .lean();

    if (!transactions.length) {
      res.status(404).json({
        success: false,
        message: 'No transactions found to export with the specified filters.',
      });
      return;
    }

    // Transform data according to column configurations
    const transformedData = transactions.map((t) => {
      const row: any = {};

      columns.forEach((col: string) => {
        let val = (t as any)[col];

        if (col === 'date' && val) {
          const d = new Date(val);
          val = dateFormat === 'locale' ? d.toLocaleDateString() : d.toISOString();
        } else if (col === 'amount' && val !== undefined) {
          val = formatCurrency ? `$${Number(val).toFixed(2)}` : Number(val).toFixed(2);
        }

        const headerName = columnAliases[col] || col.toUpperCase();
        row[headerName] = val;
      });

      return row;
    });

    const fields = columns.map((col: string) => columnAliases[col] || col.toUpperCase());
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(transformedData);

    const filename = `financial_transactions_${Date.now()}.csv`;

    res.header('Content-Type', 'text/csv');
    res.attachment(filename);
    res.status(200).send(csv);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate CSV export',
      error: error.message,
    });
  }
};
