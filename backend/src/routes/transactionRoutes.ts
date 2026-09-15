import { Router } from 'express';
import {
  getTransactions,
  getStats,
  exportCsv,
} from '../controllers/transactionController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// All transaction endpoints protected by JWT authentication
router.use(authenticateJWT);

// GET /api/transactions - paginated, searchable, sortable, filterable
router.get('/', getTransactions);

// GET /api/transactions/stats - financial analytics metrics and charts aggregation
router.get('/stats', getStats);

// POST /api/transactions/export-csv - configurable columns CSV export
router.post('/export-csv', exportCsv);

export default router;
