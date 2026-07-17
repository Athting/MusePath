import express from 'express'
import { healthController, getDashboardController } from '../controllers/dashboard.controller.js'
import { discoverSongsController, getVideosController } from '../controllers/discovery.controller.js'
import { generatePlanController, getPlansController, setActivePlanController } from '../controllers/plan.controller.js'
import { getProfileController, updateProfileController } from '../controllers/profile.controller.js'
import { getProgressController, logProgressController } from '../controllers/progress.controller.js'
import { deleteSavedSongController, saveSongController } from '../controllers/savedSong.controller.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.use(requireAuth)

router.get('/health', healthController)
router.post('/generate-plan', generatePlanController)
router.get('/dashboard', getDashboardController)
router.get('/discover', discoverSongsController)
router.get('/videos', getVideosController)
router.post('/progress', logProgressController)
router.get('/progress', getProgressController)
router.post('/save-song', saveSongController)
router.delete('/save-song', deleteSavedSongController)
router.get('/profile', getProfileController)
router.patch('/profile', updateProfileController)
router.get('/plans', getPlansController)
router.post('/plans/active', setActivePlanController)

export default router
